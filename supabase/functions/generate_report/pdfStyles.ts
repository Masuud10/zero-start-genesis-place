
export const pdfStyles = {
  title: {
    fontSize: 24,
    bold: true,
    color: '#1F2937',
    alignment: 'center' as const
  },
  header: {
    fontSize: 18,
    bold: true,
    color: '#374151',
    margin: [0, 15, 0, 8] as [number, number, number, number]
  },
  subheader: {
    fontSize: 14,
    bold: true,
    color: '#4B5563',
    margin: [0, 10, 0, 5] as [number, number, number, number]
  },
  tableHeader: {
    bold: true,
    fontSize: 12,
    color: 'white',
    fillColor: '#3B82F6'
  },
  date: {
    fontSize: 10,
    color: '#6B7280',
    italics: true
  },
  footer: {
    fontSize: 10,
    color: '#6B7280',
    alignment: 'center' as const
  },
  error: {
    fontSize: 14,
    color: '#DC2626',
    bold: true
  }
};

export const defaultStyle = {
  fontSize: 11,
  lineHeight: 1.3,
  color: '#374151'
};
