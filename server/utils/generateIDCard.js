const PDFDocument = require("pdfkit");
const fs = require("fs");

exports.generateIDCard = (staff) => {
  const doc = new PDFDocument();

  doc.pipe(fs.createWriteStream(`./uploads/idcards/${staff._id}.pdf`));

  doc.fontSize(20).text("Society Staff ID Card");
  doc.text(`Name: ${staff.name}`);
  doc.text(`Role: ${staff.role}`);
  doc.text(`Phone: ${staff.phone}`);

  doc.end();
};


