// controllers/resumeController.js
import pdf from "html-pdf";
import { generateResumeTemplate } from "../views/resumeTemplate.js";

export const createPdf = (req, res) => {
  const resumeData = req.body;
  const html = generateResumeTemplate(resumeData);

  pdf.create(html, {}).toFile("Resume.pdf", (err) => {
    if (err) {
      return res
        .status(500)
        .json({ success: false, message: "PDF generation failed" });
    }
    res
      .status(200)
      .json({ success: true, message: "PDF generated successfully" });
  });
};

export const fetchPdf = (req, res) => {
  res.sendFile(`${__dirname}/Resume.pdf`);
};
