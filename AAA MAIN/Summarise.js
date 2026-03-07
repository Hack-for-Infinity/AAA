(function() {
    'use strict';

    class PageSummarizer {
        constructor(apiKey) {
            this.apiKey = apiKey;
        }

        extractText() {
            try {
                const cloned = document.documentElement.cloneNode(true);
                const unwanted = cloned.querySelectorAll('script, style, noscript, [aria-hidden="true"]');
                unwanted.forEach(el => el.remove());
                const text = cloned.body?.innerText || cloned.innerText || '';
                return text.slice(0, 8000).trim();
            } catch (e) {
                console.error('Text extraction failed:', e);
                return '';
            }
        }

        async summarize() {
            const text = this.extractText();
            if (!text) throw new Error('No text found');

            const res = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: [{ role: 'user', content: `Summarize in 5 bullet points:\n\n${text}` }],
                    max_tokens: 500
                })
            });

            if (!res.ok) throw new Error(`API Error ${res.status}`);
            const data = await res.json();
            return data.choices[0].message.content;
        }
    }

    chrome.runtime.onMessage.addListener((req, sender, send) => {
        if (req.action === 'summarize') {
            new PageSummarizer(req.apiKey).summarize()
                .then(summary => send({ success: true, summary }))
                .catch(err => send({ success: false, error: err.message }));
            return true;
        }
    });
})();