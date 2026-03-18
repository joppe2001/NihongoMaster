use crate::srs::fsrs::{CardSchedule, CardState, Rating, SchedulingResult, FSRS};
use chrono::{NaiveDateTime, Utc};
use serde::{Deserialize, Serialize};

/// High-level scheduler that wraps FSRS and manages card state transitions
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReviewResult {
    pub new_state: String,
    pub new_stability: f64,
    pub new_difficulty: f64,
    pub scheduled_days: u32,
    pub due_date: String,
}

/// Process a review and compute the next schedule
pub fn process_review(
    state: &str,
    stability: f64,
    difficulty: f64,
    elapsed_days: u32,
    scheduled_days: u32,
    reps: u32,
    lapses: u32,
    rating: i32,
) -> ReviewResult {
    let fsrs = FSRS::new();

    let card = CardSchedule {
        state: CardState::from_str(state),
        stability,
        difficulty,
        elapsed_days,
        scheduled_days,
        reps,
        lapses,
    };

    let result: SchedulingResult = fsrs.schedule(&card, Rating::from_i32(rating));

    let now = Utc::now().naive_utc();
    let due = now + chrono::Duration::days(result.scheduled_days as i64);

    ReviewResult {
        new_state: result.state.as_str().to_string(),
        new_stability: result.stability,
        new_difficulty: result.difficulty,
        scheduled_days: result.scheduled_days,
        due_date: due.format("%Y-%m-%d %H:%M:%S").to_string(),
    }
}

/// Calculate the retrievability (probability of recall) for a card
#[allow(dead_code)]
pub fn get_retrievability(stability: f64, elapsed_days: u32) -> f64 {
    if stability <= 0.0 {
        return 0.0;
    }
    let t = elapsed_days as f64;
    (1.0 + t / (9.0 * stability)).powf(-1.0)
}

/// Add a fuzz factor to intervals to prevent clustering of reviews
#[allow(dead_code)]
pub fn apply_fuzz(interval: u32) -> u32 {
    if interval < 3 {
        return interval;
    }

    let fuzz_range = (interval as f64 * 0.05).max(1.0) as u32;
    let fuzz: i32 = (rand::random::<u32>() % (fuzz_range * 2 + 1)) as i32 - fuzz_range as i32;
    (interval as i32 + fuzz).max(1) as u32
}

/// Get the next scheduled date as a formatted string
#[allow(dead_code)]
pub fn get_next_due_date(scheduled_days: u32) -> String {
    let now = Utc::now().naive_utc();
    let fuzzed_days = apply_fuzz(scheduled_days);
    let due = now + chrono::Duration::days(fuzzed_days as i64);
    due.format("%Y-%m-%d %H:%M:%S").to_string()
}

/// Parse a date string into NaiveDateTime
#[allow(dead_code)]
pub fn parse_date(date_str: &str) -> Option<NaiveDateTime> {
    NaiveDateTime::parse_from_str(date_str, "%Y-%m-%d %H:%M:%S").ok()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_process_review_new_card() {
        let result = process_review("new", 0.0, 0.0, 0, 0, 0, 0, 3);
        assert_eq!(result.new_state, "review");
        assert!(result.scheduled_days > 0);
        assert!(result.new_stability > 0.0);
    }

    #[test]
    fn test_process_review_again() {
        let result = process_review("review", 10.0, 5.0, 10, 10, 5, 0, 1);
        assert_eq!(result.new_state, "relearning");
        assert_eq!(result.scheduled_days, 0);
    }

    #[test]
    fn test_fuzz_small_intervals_unchanged() {
        assert_eq!(apply_fuzz(1), 1);
        assert_eq!(apply_fuzz(2), 2);
    }

    #[test]
    fn test_fuzz_larger_intervals() {
        let interval = 30;
        let fuzzed = apply_fuzz(interval);
        // Should be within 5% range
        assert!(fuzzed >= 28 && fuzzed <= 32);
    }
}
