use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct UserProgress {
    pub current_level: String,
    pub xp: u64,
    pub streak_days: u32,
    pub total_cards_learned: u32,
    pub total_reviews: u32,
    pub today_reviews: u32,
    pub today_new_cards: u32,
}

/// Get the current user's overall progress
#[tauri::command]
pub fn get_user_progress() -> Result<UserProgress, String> {
    // Placeholder - will be computed from user tables via SQL plugin
    Ok(UserProgress {
        current_level: "N5".to_string(),
        xp: 0,
        streak_days: 0,
        total_cards_learned: 0,
        total_reviews: 0,
        today_reviews: 0,
        today_new_cards: 0,
    })
}

/// Update the user's study streak
#[tauri::command]
pub fn update_streak(last_study_date: Option<String>) -> Result<u32, String> {
    let today = chrono::Utc::now().format("%Y-%m-%d").to_string();

    match last_study_date {
        Some(last_date) => {
            if last_date == today {
                // Already studied today, no change
                Ok(0) // Return 0 meaning "no increment"
            } else {
                // Check if it was yesterday
                let yesterday = (chrono::Utc::now() - chrono::Duration::days(1))
                    .format("%Y-%m-%d")
                    .to_string();

                if last_date == yesterday {
                    Ok(1) // Increment streak by 1
                } else {
                    Ok(0) // Streak broken, will reset on frontend
                }
            }
        }
        None => {
            // First study session ever
            Ok(1)
        }
    }
}
