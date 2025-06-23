
// PDF styling configuration for reports

export const pdfStyles = {
  title: {
    fontSize: 20,
    bold: true,
    color: '#1f2937',
    alignment: 'center'
  },
  header: {
    fontSize: 16,
    bold: true,
    color: '#374151',
    margin: [0, 10, 0, 5]
  },
  subheader: {
    fontSize: 14,
    bold: true,
    color: '#4b5563',
    margin: [0, 8, 0, 4]
  },
  bigNumber: {
    fontSize: 24,
    bold: true,
    color: '#059669',
    alignment: 'center'
  },
  error: {
    fontSize: 12,
    color: '#dc2626',
    italics: true
  },
  date: {
    fontSize: 10,
    color: '#6b7280',
    italics: true
  },
  footer: {
    fontSize: 10,
    color: '#9ca3af',
    italics: true
  }
};

export const defaultStyle = {
  fontSize: 11,
  color: '#374151',
  lineHeight: 1.3
};
