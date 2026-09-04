// Performance score calculate karna
export const calculatePerformanceScore = (post) => {
  return (
    (post.watch_time || 0) * 0.30 +
    (post.shares || 0) * 0.25 +
    (post.views || 0) * 0.20 +
    (post.likes || 0) * 0.10 +
    (post.comments || 0) * 0.10 +
    (post.saves || 0) * 0.05
  );
};

// Best time calculate karna from posts
export const calculateBestTime = (posts) => {
  if (!posts || posts.length === 0) {
    return { time: '20:00', score: 85, confidence: 'low' };
  }

  const hourMap = {};

  posts.forEach((post) => {
    const hour = new Date(post.posted_at).getHours();
    const score = calculatePerformanceScore(post);

    if (!hourMap[hour]) {
      hourMap[hour] = { total: 0, count: 0 };
    }
    hourMap[hour].total += score;
    hourMap[hour].count += 1;
  });

  let bestHour = 20;
  let bestAvg = 0;

  Object.entries(hourMap).forEach(([hour, val]) => {
    const avg = val.total / val.count;
    if (avg > bestAvg) {
      bestAvg = avg;
      bestHour = parseInt(hour);
    }
  });

  const confidence = posts.length >= 10 ? 'high' : posts.length >= 5 ? 'medium' : 'low';

  return {
    time: `${bestHour.toString().padStart(2, '0')}:00`,
    score: Math.min(99, Math.round(bestAvg / 100) || 85),
    confidence,
  };
};

// Weekly best times calculate karna
export const calculateWeeklySchedule = (posts) => {
  const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  const defaultTimes = ['19:30', '20:00', '20:15', '19:45', '20:30', '21:00', '20:00'];
  const defaultScores = [83, 88, 91, 85, 94, 89, 92];

  if (!posts || posts.length < 5) {
    return days.map((day, i) => ({
      day,
      time: defaultTimes[i],
      score: defaultScores[i],
    }));
  }

  const dayHourMap = {};

  posts.forEach((post) => {
    const date = new Date(post.posted_at);
    const day = date.getDay();
    const hour = date.getHours();
    const score = calculatePerformanceScore(post);

    if (!dayHourMap[day]) dayHourMap[day] = {};
    if (!dayHourMap[day][hour]) dayHourMap[day][hour] = { total: 0, count: 0 };

    dayHourMap[day][hour].total += score;
    dayHourMap[day][hour].count += 1;
  });

  return days.map((day, i) => {
    if (!dayHourMap[i]) {
      return { day, time: defaultTimes[i], score: defaultScores[i] };
    }

    let bestHour = 20;
    let bestAvg = 0;

    Object.entries(dayHourMap[i]).forEach(([hour, val]) => {
      const avg = val.total / val.count;
      if (avg > bestAvg) {
        bestAvg = avg;
        bestHour = parseInt(hour);
      }
    });

    return {
      day,
      time: `${bestHour.toString().padStart(2, '0')}:00`,
      score: Math.min(99, Math.round(bestAvg / 100) || defaultScores[i]),
    };
  });
};

// Score color
export const getScoreColor = (score) => {
  if (score >= 90) return '#22c55e';
  if (score >= 75) return '#f59e0b';
  return '#ef4444';
};

// Score label (French)
export const getScoreLabel = (score) => {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Bon';
  return 'Faible';
};

// Format number
export const formatNumber = (num) => {
  if (!num) return '0';
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

// Morocco time
export const getMoroccoTime = () => {
  return new Date().toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Africa/Casablanca',
  });
};

// Morocco date
export const getMoroccoDate = () => {
  return new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'Africa/Casablanca',
  });
};