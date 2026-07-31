import Groq from 'groq-sdk';
import pool from '../config/db.js';

// Setup Groq SDK helper
const getGroqClient = () => {
    const key = process.env.GROQ_API_KEY;
    if (!key || key === 'your_groq_api_key') {
        return null;
    }
    return new Groq({ apiKey: key });
};

// POST /api/ai/suggest-price
export const suggestPrice = async (req, res) => {
    try {
        const { origin, destination } = req.body;

        if (!origin || !destination) {
            return res.status(400).json({ message: 'origin and destination required' });
        }

        const groq = getGroqClient();

        if (!groq) {
            console.warn('WARNING: GROQ_API_KEY is missing. Returning fallback mock suggestion.');
            return res.status(200).json({
                distance: "150 km",
                petrol_cost: "₹1,050",
                toll_cost: "₹180",
                suggested_total: "₹1,230",
                raw_total: 1230,
                explanation: "Calculation based on standard estimation (GROQ_API_KEY is not configured)."
            });
        }

        const completion = await groq.chat.completions.create({
            model: 'llama-3.1-8b-instant',
            messages: [
                {
                    role: 'user',
                    content: `You are a ride cost calculator for Indian roads.
Calculate the estimated trip cost for a ride from ${origin} to ${destination} in India.
Consider:
- Average car mileage: 15 km/L
- Current petrol price: ₹105/L
- Estimate road distance between these cities
- Estimate toll charges for this route in India

Respond ONLY with a JSON object, no other text, no markdown backticks:
{
    "distance": "XXX km",
    "petrol_cost": "₹XXX",
    "toll_cost": "₹XXX",
    "suggested_total": "₹XXX",
    "raw_total": XXX,
    "explanation": "brief one line explanation"
}`
                }
            ],
            temperature: 0.3,
            max_tokens: 500,
        });

        const text = completion.choices[0].message.content;
        const clean = text.replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(clean);

        return res.status(200).json(parsed);

    } catch (err) {
        console.error('AI suggest price error:', err.message);
        return res.status(500).json({ message: 'AI suggestion failed' });
    }
};

// GET /api/ai/recommendations
export const getRecommendations = async (req, res) => {
    try {
        const userId = req.user.id;

        // Fetch user's travel history corridors
        const historyQuery = await pool.query(
            `SELECT DISTINCT origin, destination FROM bookings WHERE traveler_id = $1
             UNION
             SELECT DISTINCT origin, destination FROM rides WHERE driver_id = $1`,
            [userId]
        );

        const activeRidesQuery = await pool.query(
            `SELECT r.*, u.name AS driver_name 
             FROM rides r
             JOIN users u ON r.driver_id = u.id
             WHERE r.status = 'ACTIVE' AND r.driver_id != $1
             LIMIT 10`,
            [userId]
        );

        const history = historyQuery.rows;
        const activeRides = activeRidesQuery.rows;

        if (history.length === 0) {
            // No history: return top available active rides as recommendations
            return res.status(200).json({ recommendations: activeRides });
        }

        // Match based on historical cities
        const matched = activeRides.filter(ride => {
            return history.some(h => 
                h.origin.toLowerCase().includes(ride.origin.toLowerCase()) ||
                h.destination.toLowerCase().includes(ride.destination.toLowerCase())
            );
        });

        // Fallback to general list if match yields empty
        const finalRecs = matched.length > 0 ? matched : activeRides;

        return res.status(200).json({ recommendations: finalRecs });

    } catch (err) {
        console.error('getRecommendations error:', err.message);
        return res.status(500).json({ message: 'Server error retrieving recommendations' });
    }
};

// POST /api/ai/check-review
export const checkReviewContent = async (req, res) => {
    try {
        const { review_text } = req.body;

        if (!review_text) {
            return res.status(400).json({ message: 'review_text parameter is required' });
        }

        const groq = getGroqClient();

        if (!groq) {
            // Mock sandbox scoring verification
            const isSpam = review_text.toLowerCase().includes('promo') || review_text.toLowerCase().includes('http');
            return res.status(200).json({
                rating: isSpam ? 85 : 5,
                is_spam: isSpam,
                reason: isSpam ? "Promotional link patterns detected (Sandbox check)." : "Content appears safe (Sandbox check)."
            });
        }

        const completion = await groq.chat.completions.create({
            model: 'llama-3.1-8b-instant',
            messages: [
                {
                    role: 'user',
                    content: `You are a spam and fraud moderation assistant.
Analyze the following review content submitted by a user for safety, advertising spam, promotional links, inappropriate text, or gibberish:
"${review_text}"

Respond ONLY with a JSON object, no other text, no markdown backticks:
{
    "rating": <number from 0 to 100, representing threat level>,
    "is_spam": <true or false>,
    "reason": "brief reason summary"
}`
                }
            ],
            temperature: 0.1,
            max_tokens: 300
        });

        const text = completion.choices[0].message.content;
        const clean = text.replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(clean);

        return res.status(200).json(parsed);

    } catch (err) {
        console.error('checkReviewContent error:', err.message);
        return res.status(500).json({ message: 'AI review check failed' });
    }
};

// GET /api/ai/demand-analytics
export const getDemandAnalytics = async (req, res) => {
    try {
        // Compute intercity request density
        const result = await pool.query(
            `SELECT origin, destination, COUNT(*) AS request_count, SUM(seats_booked) AS total_seats
             FROM bookings
             GROUP BY origin, destination
             ORDER BY request_count DESC
             LIMIT 10`
        );
        return res.status(200).json({ corridors: result.rows });
    } catch (err) {
        console.error('getDemandAnalytics error:', err);
        return res.status(500).json({ message: 'Server error retrieving demand statistics' });
    }
};