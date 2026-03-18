use crate::srs::scheduler;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct ReviewStats {
    pub total_reviews: u32,
    pub correct_reviews: u32,
    pub accuracy: f64,
    pub average_time_ms: u64,
}

/// Submit a review and get the updated card schedule
#[tauri::command]
pub fn submit_review(
    card_state: String,
    stability: f64,
    difficulty: f64,
    elapsed_days: u32,
    scheduled_days: u32,
    reps: u32,
    lapses: u32,
    rating: i32,
) -> Result<scheduler::ReviewResult, String> {
    let result = scheduler::process_review(
        &card_state,
        stability,
        difficulty,
        elapsed_days,
        scheduled_days,
        reps,
        lapses,
        rating,
    );

    Ok(result)
}

/// Get review statistics for the current session
#[tauri::command]
pub fn get_review_stats() -> Result<ReviewStats, String> {
    // Placeholder - stats will be computed from review_history via SQL plugin
    Ok(ReviewStats {
        total_reviews: 0,
        correct_reviews: 0,
        accuracy: 0.0,
        average_time_ms: 0,
    })
}
