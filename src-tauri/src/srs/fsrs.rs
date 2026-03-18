use serde::{Deserialize, Serialize};

/// FSRS (Free Spaced Repetition Scheduler) implementation
/// Based on the open-spaced-repetition/fsrs4anki algorithm
/// Reference: https://github.com/open-spaced-repetition/fsrs4anki

/// Default FSRS parameters (optimized from large dataset)
pub const DEFAULT_WEIGHTS: [f64; 19] = [
    0.4072, 1.1829, 3.1262, 15.4722, // w0-w3: initial stability for Again/Hard/Good/Easy
    7.2102, 0.5316, 1.0651, 0.0589, // w4-w7: difficulty
    1.5330, 0.1618, 1.0190, // w8-w10: stability after success
    2.0902, 0.0500, 0.3305, 1.3587, // w11-w14: stability after failure
    0.2315, 2.9898, 0.5100, 0.6800, // w15-w18: short-term scheduling
];

/// Card states in the FSRS model
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum CardState {
    New,
    Learning,
    Review,
    Relearning,
}

impl CardState {
    pub fn as_str(&self) -> &'static str {
        match self {
            CardState::New => "new",
            CardState::Learning => "learning",
            CardState::Review => "review",
            CardState::Relearning => "relearning",
        }
    }

    pub fn from_str(s: &str) -> Self {
        match s {
            "learning" => CardState::Learning,
            "review" => CardState::Review,
            "relearning" => CardState::Relearning,
            _ => CardState::New,
        }
    }
}

/// Rating given by the user after reviewing a card
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum Rating {
    Again = 1,
    Hard = 2,
    Good = 3,
    Easy = 4,
}

impl Rating {
    pub fn from_i32(value: i32) -> Self {
        match value {
            1 => Rating::Again,
            2 => Rating::Hard,
            3 => Rating::Good,
            4 => Rating::Easy,
            _ => Rating::Good,
        }
    }
}

/// Represents the scheduling state of a card
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CardSchedule {
    pub state: CardState,
    pub stability: f64,
    pub difficulty: f64,
    pub elapsed_days: u32,
    pub scheduled_days: u32,
    pub reps: u32,
    pub lapses: u32,
}

impl Default for CardSchedule {
    fn default() -> Self {
        Self {
            state: CardState::New,
            stability: 0.0,
            difficulty: 0.0,
            elapsed_days: 0,
            scheduled_days: 0,
            reps: 0,
            lapses: 0,
        }
    }
}

/// Result of scheduling a card after a review
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SchedulingResult {
    pub state: CardState,
    pub stability: f64,
    pub difficulty: f64,
    pub scheduled_days: u32,
}

/// The core FSRS algorithm
pub struct FSRS {
    weights: [f64; 19],
}

impl FSRS {
    pub fn new() -> Self {
        Self {
            weights: DEFAULT_WEIGHTS,
        }
    }

    #[allow(dead_code)]
    pub fn with_weights(weights: [f64; 19]) -> Self {
        Self { weights }
    }

    /// Schedule a card based on its current state and the user's rating
    pub fn schedule(&self, card: &CardSchedule, rating: Rating) -> SchedulingResult {
        match card.state {
            CardState::New => self.schedule_new(rating),
            CardState::Learning | CardState::Relearning => self.schedule_learning(card, rating),
            CardState::Review => self.schedule_review(card, rating),
        }
    }

    fn schedule_new(&self, rating: Rating) -> SchedulingResult {
        let initial_stability = self.init_stability(rating);
        let initial_difficulty = self.init_difficulty(rating);

        let (state, days) = match rating {
            Rating::Again => (CardState::Learning, 0),
            Rating::Hard => (CardState::Learning, 0),
            Rating::Good => (CardState::Review, self.next_interval(initial_stability)),
            Rating::Easy => (CardState::Review, self.next_interval(initial_stability)),
        };

        SchedulingResult {
            state,
            stability: initial_stability,
            difficulty: initial_difficulty,
            scheduled_days: days,
        }
    }

    fn schedule_learning(&self, card: &CardSchedule, rating: Rating) -> SchedulingResult {
        let new_difficulty = self.next_difficulty(card.difficulty, rating);
        let new_stability = self.short_term_stability(card.stability, rating);

        let (state, days) = match rating {
            Rating::Again => (CardState::Learning, 0),
            Rating::Hard => (CardState::Learning, 0),
            Rating::Good => (CardState::Review, self.next_interval(new_stability)),
            Rating::Easy => (CardState::Review, self.next_interval(new_stability)),
        };

        SchedulingResult {
            state,
            stability: new_stability,
            difficulty: new_difficulty,
            scheduled_days: days,
        }
    }

    fn schedule_review(&self, card: &CardSchedule, rating: Rating) -> SchedulingResult {
        let new_difficulty = self.next_difficulty(card.difficulty, rating);
        let retrievability = self.forgetting_curve(card.elapsed_days as f64, card.stability);

        match rating {
            Rating::Again => {
                let new_stability =
                    self.next_forget_stability(card.stability, new_difficulty, retrievability);
                SchedulingResult {
                    state: CardState::Relearning,
                    stability: new_stability,
                    difficulty: new_difficulty,
                    scheduled_days: 0,
                }
            }
            _ => {
                let new_stability = self.next_recall_stability(
                    card.stability,
                    new_difficulty,
                    retrievability,
                    rating,
                );
                let interval = self.next_interval(new_stability);
                SchedulingResult {
                    state: CardState::Review,
                    stability: new_stability,
                    difficulty: new_difficulty,
                    scheduled_days: interval,
                }
            }
        }
    }

    /// Initial stability for a new card based on first rating
    fn init_stability(&self, rating: Rating) -> f64 {
        let idx = rating as usize - 1;
        self.weights[idx].max(0.1)
    }

    /// Initial difficulty for a new card
    fn init_difficulty(&self, rating: Rating) -> f64 {
        let d = self.weights[4] - (rating as i32 as f64 - 3.0) * self.weights[5];
        self.constrain_difficulty(d)
    }

    /// Calculate the next difficulty after a review
    fn next_difficulty(&self, d: f64, rating: Rating) -> f64 {
        let delta = -(self.weights[6] * (rating as i32 as f64 - 3.0));
        let new_d = d + delta * self.mean_reversion(d);
        self.constrain_difficulty(new_d)
    }

    /// Mean reversion factor to prevent difficulty from drifting too far
    fn mean_reversion(&self, d: f64) -> f64 {
        let init_d = self.weights[4];
        self.weights[7] * init_d + (1.0 - self.weights[7]) * d
    }

    /// Keep difficulty in [1, 10] range
    fn constrain_difficulty(&self, d: f64) -> f64 {
        d.clamp(1.0, 10.0)
    }

    /// Power forgetting curve: R = (1 + t/S)^-1 * factor
    fn forgetting_curve(&self, elapsed_days: f64, stability: f64) -> f64 {
        if stability <= 0.0 {
            return 0.0;
        }
        (1.0 + elapsed_days / (9.0 * stability)).powf(-1.0)
    }

    /// Stability after successful recall
    fn next_recall_stability(&self, s: f64, d: f64, r: f64, rating: Rating) -> f64 {
        let hard_penalty = if rating == Rating::Hard {
            self.weights[15]
        } else {
            1.0
        };
        let easy_bonus = if rating == Rating::Easy {
            self.weights[16]
        } else {
            1.0
        };

        let new_s = s
            * (1.0
                + f64::exp(self.weights[8])
                    * (11.0 - d)
                    * s.powf(-self.weights[9])
                    * (f64::exp((1.0 - r) * self.weights[10]) - 1.0)
                    * hard_penalty
                    * easy_bonus);

        new_s.max(0.1)
    }

    /// Stability after forgetting (lapse)
    fn next_forget_stability(&self, s: f64, d: f64, r: f64) -> f64 {
        let new_s = self.weights[11]
            * d.powf(-self.weights[12])
            * ((s + 1.0).powf(self.weights[13]) - 1.0)
            * f64::exp((1.0 - r) * self.weights[14]);

        new_s.clamp(0.1, s)
    }

    /// Short-term stability update for learning/relearning cards
    fn short_term_stability(&self, s: f64, rating: Rating) -> f64 {
        let new_s =
            s * f64::exp(self.weights[17] * (rating as i32 as f64 - 3.0 + self.weights[18]));
        new_s.max(0.1)
    }

    /// Convert stability to an interval in days
    fn next_interval(&self, stability: f64) -> u32 {
        let desired_retention = 0.9; // 90% target retention
        let interval = (9.0 * stability * (1.0 / desired_retention - 1.0)).round() as u32;
        interval.max(1).min(36500) // 1 day to 100 years
    }
}

impl Default for FSRS {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_new_card_again() {
        let fsrs = FSRS::new();
        let card = CardSchedule::default();
        let result = fsrs.schedule(&card, Rating::Again);
        assert_eq!(result.state, CardState::Learning);
        assert_eq!(result.scheduled_days, 0);
        assert!(result.stability > 0.0);
    }

    #[test]
    fn test_new_card_good() {
        let fsrs = FSRS::new();
        let card = CardSchedule::default();
        let result = fsrs.schedule(&card, Rating::Good);
        assert_eq!(result.state, CardState::Review);
        assert!(result.scheduled_days > 0);
        assert!(result.stability > 0.0);
    }

    #[test]
    fn test_new_card_easy() {
        let fsrs = FSRS::new();
        let card = CardSchedule::default();
        let result = fsrs.schedule(&card, Rating::Easy);
        assert_eq!(result.state, CardState::Review);
        assert!(result.scheduled_days > 0);
    }

    #[test]
    fn test_review_card_again_causes_relearning() {
        let fsrs = FSRS::new();
        let card = CardSchedule {
            state: CardState::Review,
            stability: 10.0,
            difficulty: 5.0,
            elapsed_days: 10,
            scheduled_days: 10,
            reps: 5,
            lapses: 0,
        };
        let result = fsrs.schedule(&card, Rating::Again);
        assert_eq!(result.state, CardState::Relearning);
        assert_eq!(result.scheduled_days, 0);
    }

    #[test]
    fn test_difficulty_stays_in_range() {
        let fsrs = FSRS::new();
        let d = fsrs.constrain_difficulty(15.0);
        assert_eq!(d, 10.0);
        let d = fsrs.constrain_difficulty(-5.0);
        assert_eq!(d, 1.0);
    }

    #[test]
    fn test_intervals_increase_with_stability() {
        let fsrs = FSRS::new();
        let i1 = fsrs.next_interval(1.0);
        let i2 = fsrs.next_interval(10.0);
        let i3 = fsrs.next_interval(100.0);
        assert!(i1 < i2);
        assert!(i2 < i3);
    }
}
