require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Gemini API Configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = "gemini-1.5-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

// Helper: Call Gemini API
async function callGemini(prompt) {
    if (!GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is missing in .env");
    }

    const response = await fetch(GEMINI_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            contents: [{
                parts: [{ text: prompt }]
            }]
        })
    });

    if (!response.ok) {
        const errText = await response.text();
        console.error("Gemini API Error:", response.status, errText);
        throw new Error(`Gemini API Error: ${response.status}`);
    }

    const data = await response.json();

    // Extract Text safely
    try {
        const text = data.candidates[0].content.parts[0].text;
        return text;
    } catch (e) {
        console.error("Unexpected Gemini Response Structure:", JSON.stringify(data, null, 2));
        throw new Error("Invalid Gemini Response");
    }
}

// Helper: Standardize AI Response Formatting
const parseAIResponse = (content) => {
    try {
        // Attempt to parse JSON directly
        return JSON.parse(content);
    } catch (e) {
        // Fallback: If AI wraps in markdown block
        const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```\n([\s\S]*?)\n```/) || content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            try {
                // Ensure we pick the capture group if it exists, roughly trying index 1 then index 0
                const jsonStr = jsonMatch[1] || jsonMatch[0];
                return JSON.parse(jsonStr);
            } catch (e2) {
                console.error("Failed to parse AI JSON:", content);
                return null;
            }
        }
        console.error("No JSON found in response:", content);
        return null;
    }
};

// 1. AI Skill Matching (Gemini)
app.post('/api/ai-match', async (req, res) => {
    try {
        const { userSkills, userExperience, projectSkills, projectDescription } = req.body;

        // Basic Input Validation
        if (!userSkills || !projectSkills) {
            console.warn("Missing skills in request");
            return res.status(400).json({ error: "Missing skills data" });
        }

        const prompt = `
        Role: Expert Tech Recruiter and AI Architect.
        Task: Analyze the match between a user/candidate and a project.

        User Profile:
        - Skills: ${Array.isArray(userSkills) ? userSkills.join(', ') : userSkills}
        - Experience: ${userExperience || 'Not specified'}

        Project Requirements:
        - Required Skills: ${Array.isArray(projectSkills) ? projectSkills.join(', ') : projectSkills}
        - Description: ${projectDescription || 'Not specified'}

        Output exactly valid JSON (no markdown):
        {
            "matchPercentage": number (0-100),
            "matchedSkills": ["string"],
            "missingSkills": ["string"],
            "strengthAnalysis": "string (concise summary for UI)",
            "weaknessAnalysis": "string (concise summary for UI)",
            "roleRecommendation": "string",
            "strengths": ["string", "string"],
            "weaknesses": ["string", "string"],
            "suggestions": ["string"]
        }
        
        CRITICAL: "matchPercentage" MUST be a number.
        `;

        let result = null;
        try {
            const textResponse = await callGemini(prompt);
            result = parseAIResponse(textResponse);
        } catch (apiError) {
            console.error("Gemini API Call Failed:", apiError.message);
        }

        // Validate Result Structure or Use Fallback
        if (!result || typeof result.matchPercentage !== 'number') {
            console.warn("Invalid or missing AI response. Using deterministic fallback.");

            // Deterministic Fallback Logic
            const uSkills = Array.isArray(userSkills) ? userSkills : (typeof userSkills === 'string' ? userSkills.split(',') : []);
            const pSkills = Array.isArray(projectSkills) ? projectSkills : (typeof projectSkills === 'string' ? projectSkills.split(',') : []);

            // Normalize
            const normUSkills = uSkills.map(s => s.trim().toLowerCase());
            const normPSkills = pSkills.map(s => s.trim().toLowerCase());

            // Calculate Common
            const common = pSkills.filter((s, i) => normUSkills.includes(normPSkills[i]));
            const missing = pSkills.filter((s, i) => !normUSkills.includes(normPSkills[i]));

            const matchPct = pSkills.length > 0 ? Math.round((common.length / pSkills.length) * 100) : 0;

            result = {
                matchPercentage: matchPct,
                matchedSkills: common,
                missingSkills: missing,
                strengthAnalysis: `Matches ${common.length} of ${pSkills.length} required skills.`,
                weaknessAnalysis: missing.length > 0 ? `Missing ${missing.length} requirements.` : "No significant gaps.",
                roleRecommendation: common.length > pSkills.length / 2 ? "Contributor" : "Learner",
                strengths: common.length > 0 ? [`Has proper ${common.slice(0, 2).join(', ')} skills`] : ["Eager to learn"],
                weaknesses: missing.length > 0 ? [`Lacks ${missing.slice(0, 2).join(', ')}`] : [],
                suggestions: ["Update profile with more skills", "Message project owner"]
            };
        }

        res.json(result);

    } catch (error) {
        console.error("Critical AI Service Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Backward compatibility
app.post('/api/match-skills', async (req, res) => {
    return app._router.handle({ ...req, url: '/api/ai-match', method: 'POST' }, res, () => { });
});

// 2. Skill Gap Analysis (Gemini)
app.post('/api/gap-analysis', async (req, res) => {
    try {
        const { requiredSkills, projectDescription } = req.body;

        const prompt = `
        Analyze this project team composition plan.
        
        Project:
        - Description: ${projectDescription}
        - Current Required Skills: ${Array.isArray(requiredSkills) ? requiredSkills.join(', ') : requiredSkills}

        Output exactly valid JSON (no markdown):
        {
            "missingSkills": ["string"],
            "suggestedRoles": ["string"],
            "riskAnalysis": ["string"]
        }
        `;

        let result = null;
        try {
            const textResponse = await callGemini(prompt);
            result = parseAIResponse(textResponse);
        } catch (e) { console.error("Gap Analysis API Error", e); }

        // Fallback
        if (!result) {
            result = {
                missingSkills: ["Analysis unavailable"],
                suggestedRoles: ["Full Stack Developer"],
                riskAnalysis: ["Ensure balanced team"]
            };
        }

        res.json(result);

    } catch (error) {
        console.error("Gap Analysis Error:", error);
        res.status(500).json({ error: "AI Service Error" });
    }
});

// 3. Smart Recommendations (Gemini)
app.post('/api/recommendations', async (req, res) => {
    try {
        const { userSkills } = req.body;

        const prompt = `
        Based on the user's skills: ${userSkills}, suggest 3 types of projects they would be great at building.
        
        Output exactly valid JSON (no markdown):
        {
            "recommendations": [
                { "title": "string", "reason": "string" }
            ]
        }
        `;

        const textResponse = await callGemini(prompt);
        const result = parseAIResponse(textResponse);
        res.json(result || { recommendations: [] });

    } catch (error) {
        console.error("Recommendation Error:", error);
        res.status(500).json({ error: "AI Service Error" });
    }
});

// Start Server
app.listen(port, () => {
    console.log(`AI Backend (Gemini) running on http://localhost:${port}`);
});
