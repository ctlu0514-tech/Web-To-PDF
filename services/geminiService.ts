import { GoogleGenAI } from "@google/genai";
import { GeneratedResult } from "../types";

export const generateScraperScript = async (
  screenshotBase64: string, 
  targetUrl: string,
  extraInstructions: string
): Promise<GeneratedResult> => {
  // Use apiKey directly from process.env.API_KEY as per coding guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Escaped backticks in the prompt to prevent syntax errors
  const prompt = `
    You are an expert web automation engineer.

    The user is a non-technical person who wants to turn a documentation website into a PDF.
    **CRITICAL CONSTRAINT**: The user CANNOT install Python locally. They must run this in **Google Colab**.
    
    **USER PROBLEM**: The user reported that previous scripts resulted in PDFs where "tags/headers were blocking the content".
    **SOLUTION**: You MUST write code that aggressively removes ALL sticky headers, floating footers, and cookie banners before capturing the PDF.

    Target URL: ${targetUrl}
    User Notes: ${extraInstructions}
    
    Attached is a screenshot of the website's layout.

    Your Task:
    1. ANALYZE the screenshot to identify the Sidebar/Navigation structure.
    
    2. WRITE A PYTHON SCRIPT specifically designed for a **Jupyter Notebook / Google Colab** environment.
       - **Prerequisites Block**: Start the script with cell magic commands to install dependencies automatically:
         \`\`\`python
         # @title 1. 安装依赖 (点击左侧播放按钮运行)
         !pip install playwright pypdf nest_asyncio
         !playwright install chromium
         !playwright install-deps
         import nest_asyncio
         nest_asyncio.apply()
         print("环境安装完成！请继续运行下一个代码块。")
         \`\`\`
       - **Main Logic Block**:
         - Use 'playwright' (async).
         - Browser MUST be headless (\`headless=True\`).
         - Scrape the sidebar from the Target URL to get all links.
         - Iterate through links.
         - **AGGRESSIVE CLEANUP (Vital)**: 
           - Inject JavaScript to remove the sidebar, header, footer.
           - **CRITICAL**: Iterate through ALL elements in the DOM. If an element has \`position: fixed\` or \`position: sticky\`, delete it or set \`display: none\`. This is required to stop headers from covering text.
           - Example logic to include:
             \`\`\`python
             await page.evaluate("""
                 const elements = document.querySelectorAll('*');
                 for (const el of elements) {
                     const style = window.getComputedStyle(el);
                     if (style.position === 'fixed' || style.position === 'sticky') {
                         el.style.display = 'none';
                     }
                 }
                 // Also specifically target common nuisance selectors
                 const selectors = ['nav', 'header', 'footer', '.cookie-banner', '#sidebar', '.ads'];
                 selectors.forEach(s => {
                    const el = document.querySelector(s);
                    if(el) el.style.display = 'none';
                 });
             """)
             \`\`\`
         - Print page to PDF.
         - Merge PDFs using \`pypdf\`.
         - Use \`google.colab.files.download('documentation.pdf')\`.

    3. PROVIDE INSTRUCTIONS (Simplified Chinese):
       - Step 1: Click the "Open Google Colab" button.
       - Step 2: Create a new notebook.
       - Step 3: Copy the code below into the cell.
       - Step 4: Run it.

    Return JSON:
    {
      "script": "The full python code...",
      "instructions": "Simple step-by-step guide for Google Colab...",
      "explanation": "Brief explanation of how the script specifically handles the 'blocking content' issue (e.g., removing fixed elements)."
    }
  `;

  try {
    // Use gemini-3-pro-preview for complex text/code generation tasks
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: screenshotBase64
            }
          },
          {
            text: prompt
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    return JSON.parse(text) as GeneratedResult;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate script. Please check your API key and try again.");
  }
};