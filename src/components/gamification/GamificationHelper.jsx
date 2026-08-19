import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

/**
 * Helper functions for gamification system
 */

// Calculate points based on exam performance
export const calculateExamPoints = (exam) => {
  let points = 0;
  
  // Base points for completion
  points += 50;
  
  // Score-based points
  if (exam.score_percentage >= 90) points += 100;
  else if (exam.score_percentage >= 80) points += 75;
  else if (exam.score_percentage >= 70) points += 50;
  else if (exam.score_percentage >= 60) points += 25;
  
  // Perfect score bonus
  if (exam.score_percentage === 100) points += 150;
  
  // Difficulty multiplier
  if (exam.difficulty === 'advanced') points *= 1.5;
  else if (exam.difficulty === 'intermediate') points *= 1.2;
  
  // Passing bonus
  if (exam.status === 'passed') points += 30;
  
  return Math.floor(points);
};

// Calculate level based on total points
export const calculateLevel = (totalPoints) => {
  return Math.floor(totalPoints / 1000) + 1;
};

// Check and update streak
export const updateStreak = async (userEmail) => {
  try {
    const progress = await base44.entities.UserProgress.filter({ user_email: userEmail });
    if (progress.length === 0) return;
    
    const userProgress = progress[0];
    const today = new Date().toISOString().split('T')[0];
    const lastActivity = userProgress.last_activity_date;
    
    // If no last activity, start new streak
    if (!lastActivity) {
      await base44.entities.UserProgress.update(userProgress.id, {
        current_streak: 1,
        longest_streak: Math.max(1, userProgress.longest_streak || 0),
        last_activity_date: today
      });
      return;
    }
    
    const lastDate = new Date(lastActivity);
    const todayDate = new Date(today);
    const diffDays = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));
    
    let newStreak = userProgress.current_streak || 0;
    
    if (diffDays === 0) {
      // Same day, no change
      return;
    } else if (diffDays === 1) {
      // Consecutive day, increment streak
      newStreak = (userProgress.current_streak || 0) + 1;
    } else {
      // Streak broken, reset to 1
      newStreak = 1;
    }
    
    await base44.entities.UserProgress.update(userProgress.id, {
      current_streak: newStreak,
      longest_streak: Math.max(newStreak, userProgress.longest_streak || 0),
      last_activity_date: today
    });
    
    // Award streak badges
    if (newStreak === 7 && !userProgress.badges_earned?.includes('streak_7')) {
      await awardBadge(userEmail, 'streak_7', "Week Warrior badge earned! 🔥");
    } else if (newStreak === 30 && !userProgress.badges_earned?.includes('streak_30')) {
      await awardBadge(userEmail, 'streak_30', "Month Master badge earned! 🔥🔥");
    } else if (newStreak === 100 && !userProgress.badges_earned?.includes('streak_100')) {
      await awardBadge(userEmail, 'streak_100', "Streak Legend badge earned! 🔥🔥🔥");
    }
  } catch (error) {
    console.error('Error updating streak:', error);
  }
};

// Award badge to user
export const awardBadge = async (userEmail, badgeId, message) => {
  try {
    const progress = await base44.entities.UserProgress.filter({ user_email: userEmail });
    if (progress.length === 0) return;
    
    const userProgress = progress[0];
    const badges = userProgress.badges_earned || [];
    
    if (!badges.includes(badgeId)) {
      await base44.entities.UserProgress.update(userProgress.id, {
        badges_earned: [...badges, badgeId]
      });
      
      if (message) {
        toast.success(message, { duration: 5000 });
      }
    }
  } catch (error) {
    console.error('Error awarding badge:', error);
  }
};

// Process exam completion and award points/badges
export const processExamCompletion = async (userEmail, exam) => {
  try {
    const progress = await base44.entities.UserProgress.filter({ user_email: userEmail });
    let userProgress;
    
    if (progress.length === 0) {
      // Create new progress record
      userProgress = await base44.entities.UserProgress.create({
        user_email: userEmail,
        total_points: 0,
        level: 1,
        current_streak: 0,
        longest_streak: 0,
        badges_earned: [],
        completed_challenges: [],
        frameworks_mastered: [],
        total_exams_passed: 0,
        perfect_scores_count: 0,
        study_time_minutes: 0
      });
    } else {
      userProgress = progress[0];
    }
    
    // Calculate points
    const points = calculateExamPoints(exam);
    const newTotalPoints = (userProgress.total_points || 0) + points;
    const newLevel = calculateLevel(newTotalPoints);
    const leveledUp = newLevel > (userProgress.level || 1);
    
    // Update stats
    const updates = {
      total_points: newTotalPoints,
      level: newLevel,
      study_time_minutes: (userProgress.study_time_minutes || 0) + (exam.time_spent_minutes || 0)
    };
    
    if (exam.status === 'passed') {
      updates.total_exams_passed = (userProgress.total_exams_passed || 0) + 1;
    }
    
    if (exam.score_percentage === 100) {
      updates.perfect_scores_count = (userProgress.perfect_scores_count || 0) + 1;
    }
    
    await base44.entities.UserProgress.update(userProgress.id, updates);
    
    // Update streak
    await updateStreak(userEmail);
    
    // Award badges
    const badges = userProgress.badges_earned || [];
    
    // First exam badge
    if (updates.total_exams_passed === 1 && !badges.includes('first_exam')) {
      await awardBadge(userEmail, 'first_exam', "First Steps badge earned! 🎉");
    }
    
    // Exam count badges
    if (updates.total_exams_passed === 10 && !badges.includes('exam_master_10')) {
      await awardBadge(userEmail, 'exam_master_10', "Exam Master badge earned! 🏆");
    }
    if (updates.total_exams_passed === 25 && !badges.includes('exam_master_25')) {
      await awardBadge(userEmail, 'exam_master_25', "Exam Legend badge earned! 👑");
    }
    
    // Perfect score badges
    if (exam.score_percentage === 100) {
      if (updates.perfect_scores_count === 1 && !badges.includes('perfect_score')) {
        await awardBadge(userEmail, 'perfect_score', "Perfectionist badge earned! ⭐");
      }
      if (updates.perfect_scores_count === 5 && !badges.includes('perfect_x5')) {
        await awardBadge(userEmail, 'perfect_x5', "Flawless badge earned! ⚡");
      }
    }
    
    // Study time badges
    if (updates.study_time_minutes >= 600 && !badges.includes('study_time_10h')) {
      await awardBadge(userEmail, 'study_time_10h', "Dedicated Learner badge earned! 📚");
    }
    if (updates.study_time_minutes >= 3000 && !badges.includes('study_time_50h')) {
      await awardBadge(userEmail, 'study_time_50h', "Scholar badge earned! 🎓");
    }
    
    // Show points earned
    toast.success(`+${points} points earned! ${leveledUp ? `Level up! Now level ${newLevel}! 🎉` : ''}`, { 
      duration: 5000 
    });
    
    return { points, leveledUp, newLevel };
  } catch (error) {
    console.error('Error processing exam completion:', error);
    return null;
  }
};

// Update challenge progress
export const updateChallengeProgress = async (userEmail, challengeType, value, framework = null) => {
  try {
    const challenges = await base44.entities.Challenge.filter({
      user_email: userEmail,
      status: 'active',
      challenge_type: challengeType
    });
    
    for (const challenge of challenges) {
      // Check if framework matches (if specified)
      if (framework && challenge.framework && challenge.framework !== framework) {
        continue;
      }
      
      const newValue = (challenge.current_value || 0) + value;
      
      // Update challenge
      await base44.entities.Challenge.update(challenge.id, {
        current_value: newValue
      });
      
      // Check if completed
      if (newValue >= challenge.target_value && challenge.status === 'active') {
        await base44.entities.Challenge.update(challenge.id, {
          status: 'completed'
        });
        
        // Award rewards
        if (challenge.reward_points) {
          const progress = await base44.entities.UserProgress.filter({ user_email: userEmail });
          if (progress.length > 0) {
            const userProgress = progress[0];
            await base44.entities.UserProgress.update(userProgress.id, {
              total_points: (userProgress.total_points || 0) + challenge.reward_points,
              completed_challenges: [...(userProgress.completed_challenges || []), challenge.id]
            });
          }
        }
        
        if (challenge.reward_badge) {
          await awardBadge(userEmail, challenge.reward_badge);
        }
        
        toast.success(`Challenge completed: ${challenge.title}! 🎯`, { duration: 5000 });
      }
    }
  } catch (error) {
    console.error('Error updating challenge progress:', error);
  }
};