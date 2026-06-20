import Groq from 'groq-sdk';

<<<<<<< HEAD
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

=======
>>>>>>> main
export const suggestPrice = async (req, res) => {
    try {
        const { origin, destination } = req.body;

        if (!origin || !destination) {
            return res.status(400).json({ message: 'origin and destination required' });
        }

<<<<<<< HEAD
=======
        if (!process.env.GROQ_API_KEY) {
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

        const groq = new Groq({
            apiKey: process.env.GROQ_API_KEY,
        });

>>>>>>> main
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
<<<<<<< HEAD
};

export const calculateWaypointDistances = async (req, res) => {
    try {
        const { origin, destination, waypoints } = req.body;

        if (!origin || !destination) {
            return res.status(400).json({ message: 'origin and destination required' });
        }

        const waypointList = waypoints && waypoints.length > 0
            ? waypoints.map(wp => wp.location_name).join(', ')
            : 'none';

        const completion = await groq.chat.completions.create({
            model: 'llama-3.1-8b-instant',
            messages: [{
                role: 'user',
                content: `You are a distance calculator for Indian roads.

Calculate road distances from origin for this route in India:
Origin: ${origin}
Waypoints: ${waypointList}
Destination: ${destination}

Respond ONLY with a JSON object, no other text, no markdown:
{
    "total_distance": XXX,
    "waypoints": [
        { "location": "waypoint_name", "distance_from_origin": XXX },
        ...
    ]
}

Where distances are in kilometers as numbers only.`
            }],
            temperature: 0.1,
            max_tokens: 500,
        });

        const text = completion.choices[0].message.content;
        const clean = text.replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(clean);

        return res.status(200).json(parsed);

    } catch (err) {
        console.error('AI distances error:', err.message);
        return res.status(500).json({ message: 'Failed to calculate distances' });
    }
=======
>>>>>>> main
};