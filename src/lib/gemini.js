
const GEMINI_API_KEY = "AIzaSyDNZrWIitVzhRQh_gC18n0ZEvoj-7I7dII";
const GEMINI_MODEL = "gemini-1.5-flash";

/**
 * Reviews a document (PDF or CSV text) using Gemini AI.
 * @param {string} content - The text content or base64 data of the file.
 * @param {string} type - 'text' or 'base64'.
 * @param {string} mimeType - 'application/pdf' or 'text/csv'.
 * @returns {Promise<string>} - AI Analysis result.
 */
export async function analyzeDocument(content, type = 'text', mimeType = 'text/csv') {
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
        
        let payload;
        if (type === 'base64') {
            payload = {
                contents: [{
                    parts: [
                        { text: "Review this document for financial verification. Extract key details and flag any issues." },
                        { inline_data: { mime_type: mimeType, data: content } }
                    ]
                }]
            };
        } else {
            payload = {
                contents: [{
                    parts: [{ text: `Analyze the following CSV data and summarize key insights for an administrator:\n\n${content}` }]
                }]
            };
        }

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || "No analysis generated.";
    } catch (error) {
        console.error("Gemini Analysis Error:", error);
        return `Analysis failed: ${error.message}`;
    }
}
