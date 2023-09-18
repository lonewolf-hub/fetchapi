import fetch from 'node-fetch';
import mongoose from 'mongoose';
import openai from 'openai';


const apiKey = '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';
openai.apiKey = apiKey; // Set the API key directly

mongoose.connect("mongodb://127.0.0.1:27017/savenews");

const newsSchema = new mongoose.Schema({
    source: {
        type: Object,
        required: true
    },
    author: {
        type: String
    },
    title: {
        type: String
    },
    description: {
        type: String
    },
    url: {
        type: String
    },
    urlToImage: {
        type: String
    },
    publishedAt: {
        type: String
    },
    content: {
        type: String
    },
    summary: {
        type: String
    }
});

const News = mongoose.model('News', newsSchema);



async function getNews() {
    try {
        const getNewNews = await fetch("https://newsapi.org/v2/top-headlines?country=us&apiKey=9703f0a1b4a5419488a2eac57e4867f0");
        const response = await getNewNews.json();
        // console.log(response)
        if (response.status === 'ok') {
            const articles = response.articles;

            for (let i = 0; i < articles.length; i++) {
                const article = articles[i];

                const news = new News({
                    source: article.source,
                    author: article.author,
                    title: article.title,
                    description: article.description,
                    url: article.url,
                    urlToImage: article.urlToImage,
                    publishedAt: article.publishedAt,
                    content: article.content
                });
                async function processArticleWithGPT(article) {
                    try {
                        const response = await openai.Completion.create({
                            engine: "text-davinci-002",
                            prompt: `rephrase the following news article:\n${article.title}\n${article.description}\n${article.author}`,
                            max_tokens: 50, // Adjust the token limit as needed
                        });
                
                        return response.choices[0].text;
                    } catch (error) {
                        console.error("Error processing article with GPT-3:", error);
                        return ''; // Return an empty string in case of an error
                    }
                }
                

                await news.save();
                
            }

            console.log("News saved successfully!");
        } else {
            console.error("NewsAPI request failed with status:", response.status);
        }
    } catch (error) {
        console.error("Error fetching and saving news:", error);
    }
}

getNews();
