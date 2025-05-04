const db = require('../config/db');
const moment = require('moment');
const fs = require('fs');
const path = require('path');
const { createCanvas, registerFont } = require('canvas');
const { decrypt } = require('../utils/encrypt');
const { getWeeksOfCurrentMonth } = require('../utils/weeklyReport');

// Register fonts
registerFont(path.join(__dirname, 'fonts', 'Poppins-Bold.ttf'), { family: 'Poppins', weight: 'bold' });
registerFont(path.join(__dirname, 'fonts', 'Poppins-Regular.ttf'), { family: 'Poppins', weight: 'normal' });

exports.saveScore = async (req, res) => {
    const { encrypted_id, score } = req.body;
    if (score < 50 || score > 500) {
        return res.status(400).json({ success: false, message: 'Score out of range' });
    }

    const userId = decrypt(encrypted_id);

    // Count today's entries
    const [rows] = await db.execute(
        `SELECT COUNT(*) as count 
         FROM scores 
         WHERE user_id = ? AND DATE(created_at) = CURDATE()`,
        [userId]
    );

    if (rows[0].count >= 3) {
        return res.status(400).json({ success: false, message: 'Daily limit reached' });
    }

    // Insert new score
    await db.execute(
        'INSERT INTO scores (user_id, score, created_at) VALUES (?, ?, NOW())',
        [userId, score]
    );

    return res.json({ success: true });
};

exports.generateScoreCard = async (req, res) => {
    const { encrypted_id } = req.params;
    let userId = decrypt(encrypted_id);

    const [[user]] = await db.execute('SELECT name FROM users WHERE id = ?', [userId]);
    const [[scoreRow]] = await db.execute('SELECT SUM(score) as total FROM scores WHERE user_id = ?', [userId]);
    const [ranks] = await db.execute('SELECT user_id, SUM(score) as total FROM scores GROUP BY user_id ORDER BY total DESC');

    const rank = ranks.findIndex(u => u.user_id == userId) + 1;

    const canvas = createCanvas(1280, 720);
    const ctx = canvas.getContext('2d');

    // Draw black left panel
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, 300, 720);

    // ✅ Draw white right panel
    ctx.fillStyle = '#fff';
    ctx.fillRect(300, 0, 980, 720);

    // Draw Rank in white
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 100px Poppins';
    ctx.textAlign = 'center';
    ctx.fillText(rank.toString(), 150, 400); // Centered in black area

    // Draw "Score Card"
    ctx.fillStyle = '#000';
    ctx.textAlign = 'left';
    ctx.font = 'bold 64px Poppins';
    ctx.fillText('Score Card', 400, 200);

    // Draw User Name in blue
    ctx.fillStyle = '#3366ff';
    ctx.font = 'bold 48px Poppins';
    ctx.fillText(user.name, 400, 300);

    // Draw Score
    ctx.fillStyle = '#000';
    ctx.font = '32px Poppins';
    ctx.fillText(`Score: ${scoreRow.total || 0}`, 400, 380);

    // Draw Date
    ctx.font = '24px Poppins';
    ctx.fillText(`Date: ${moment().format('Do MMMM YY')}`, 400, 430);

    // Save image
    const buffer = canvas.toBuffer('image/jpeg');
    const outputDir = path.join(__dirname, 'scorecards');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);
    const filePath = path.join(outputDir, `${userId}.jpg`);
    fs.writeFileSync(filePath, buffer);

    res.json({ success: true, url: `/scorecards/${userId}.jpg` });
};

exports.dashboard=async (req, res) => {
  const { encrypted_id } = req.params;

    try {
    const userId = decrypt(encrypted_id);
      
    const [allScores] = await db.execute(
      'SELECT score, created_at FROM scores WHERE user_id = ?',
      [userId]
    );

    const weeks = getWeeksOfCurrentMonth();

    const result = weeks.map(({ weekNo, startDate, endDate }) => {
      let totalScore = 0;

      allScores.forEach(({ score, created_at }) => {
        const entryDate = moment(created_at);
        if (entryDate.isSameOrAfter(startDate) && entryDate.isSameOrBefore(endDate)) {
          totalScore += score;
        }
      });

      return {
        weekNo,
        startDate: startDate.format('YYYY-MM-DD'),
        endDate: endDate.format('YYYY-MM-DD'),
        totalScore,
        rank: 1 // static for now
      };
    });

    res.json({ success: true, weeks: result });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};