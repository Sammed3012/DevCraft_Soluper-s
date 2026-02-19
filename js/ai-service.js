/**
 * AI Service Integration (Frontend)
 * Calls the local Node.js backend to get Gemini insights.
 */

const AI_API_URL = 'http://localhost:3000/api'; // Local AI proxy

export const AIService = {

    // 1. Analyze Match
    async analyzeMatch(userSkills, userExperience, projectSkills, projectDesc) {
        console.log("[AIService] analyzeMatch called with:", { userSkills, projectSkills });

        try {
            const response = await fetch(`${AI_API_URL}/ai-match`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userSkills,
                    userExperience,
                    projectSkills,
                    projectDescription: projectDesc
                })
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`AI Service Unavailable: ${response.status} ${errText}`);
            }

            const data = await response.json();
            console.log("[AIService] Response:", data);

            // Validate essential fields
            if (typeof data.matchPercentage !== 'number') {
                console.warn("[AIService] Invalid match percentage received, using fallback.");
                throw new Error("Invalid Data Structure");
            }

            return data;

        } catch (error) {
            console.warn('[AIService] Analysis Failed (Using Fallback):', error);

            // Robust Client-Side Fallback
            return this.calculateFallback(userSkills, projectSkills);
        }
    },

    // 2. Gap Analysis
    async analyzeGap(skills, description) {
        try {
            const response = await fetch(`${AI_API_URL}/gap-analysis`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ requiredSkills: skills, projectDescription: description })
            });
            if (!response.ok) throw new Error('AI Service Unavailable');
            return await response.json();
        } catch (error) {
            console.warn('[AIService] Gap Analysis Failed:', error);
            return {
                missingSkills: ['Frontend/Backend balance check required'],
                suggestedRoles: ['Full Stack Developer'],
                riskAnalysis: ['Ensure diverse skill set']
            };
        }
    },

    // 3. Recommendations
    async getRecommendations(skills) {
        try {
            const response = await fetch(`${AI_API_URL}/recommendations`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userSkills: skills })
            });
            if (!response.ok) throw new Error('AI Service Unavailable');
            return await response.json();
        } catch (error) {
            console.warn('[AIService] Recommendations Failed:', error);
            return { recommendations: [] };
        }
    },

    // Client-Side Fallback Logic (Deterministic)
    calculateFallback(userSkills, projectSkills) {
        // Handle varied input types (string vs array)
        const normalize = (input) => {
            if (Array.isArray(input)) return input.map(s => s.trim().toLowerCase());
            if (typeof input === 'string') return input.split(',').map(s => s.trim().toLowerCase()).filter(s => s);
            return [];
        };

        const uSkills = normalize(userSkills);
        const pSkills = normalize(projectSkills);

        if (pSkills.length === 0) {
            return {
                matchPercentage: 0,
                strengths: ["No project skills specified"],
                weaknesses: [],
                roleRecommendation: "N/A"
            };
        }

        const common = pSkills.filter(s => uSkills.includes(s));
        const missing = pSkills.filter(s => !uSkills.includes(s));
        const pct = Math.round((common.length / pSkills.length) * 100);

        return {
            matchPercentage: pct,
            matchedSkills: common,
            missingSkills: missing,
            strengthAnalysis: `Matches ${common.length}/${pSkills.length} skills locally.`,
            weaknessAnalysis: missing.length > 0 ? "Missing critical skills." : "Good match.",
            roleRecommendation: pct > 80 ? "Lead" : (pct > 50 ? "Contributor" : "Learner"),
            strengths: common.length > 0
                ? [`Matched skills: ${common.slice(0, 3).join(', ')}`]
                : ["Enthusiastic Learner"],
            weaknesses: missing.length > 0
                ? [`Missing: ${missing.slice(0, 3).join(', ')}`]
                : [],
            suggestions: ["Connect with the team to discuss role."]
        };
    }
};
