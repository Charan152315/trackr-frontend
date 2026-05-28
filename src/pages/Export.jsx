import { useState } from "react";
import { Download, FileText, Table, CheckCircle } from "lucide-react";
import API from "../services/api";
import toast from "react-hot-toast";
import "../styles/Export.css";

const Export = () => {
  const [loadingCsv, setLoadingCsv] = useState(false);
  const [loadingPdf, setLoadingPdf] = useState(false);

  const handleExport = async (format) => {
    const setLoading = format === "csv" ? setLoadingCsv : setLoadingPdf;
    setLoading(true);
    try {
      const res = await API.get(`/expenses/export?format=${format}`, {
        responseType: "blob"
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `trackr_expenses_${new Date().toISOString().slice(0,10)}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success(`${format.toUpperCase()} downloaded!`);
    } catch {
      toast.error("Export failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const features = [
    "All personal expenses included",
    "Sorted by latest first",
    "Category and amount breakdown",
    "Clean formatted layout",
  ];

  return (
    <div className="export-page">
      <div className="export-header">
        <div className="export-header-icon"><Download size={22} /></div>
        <div>
          <h2>Export Expenses</h2>
          <p>Download your expense data in your preferred format</p>
        </div>
      </div>

      <div className="export-features">
        {features.map((f, i) => (
          <div key={i} className="export-feature-item">
            <CheckCircle size={15} className="export-check" />
            <span>{f}</span>
          </div>
        ))}
      </div>

      <div className="export-cards">
        <div className="export-card">
          <div className="export-card-icon csv-icon">
            <Table size={28} />
          </div>
          <div className="export-card-info">
            <h3>CSV Spreadsheet</h3>
            <p>Open in Excel, Google Sheets, or any spreadsheet app. Best for data analysis.</p>
          </div>
          <button
            className="btn btn-primary export-btn"
            onClick={() => handleExport("csv")}
            disabled={loadingCsv}
          >
            {loadingCsv ? (
              <><span className="spinner" style={{width:14,height:14,borderWidth:2}} /> Exporting...</>
            ) : (
              <><Download size={16} /> Download CSV</>
            )}
          </button>
        </div>

        <div className="export-card">
          <div className="export-card-icon pdf-icon">
            <FileText size={28} />
          </div>
          <div className="export-card-info">
            <h3>PDF Report</h3>
            <p>Formatted report with totals and categories. Best for sharing or printing.</p>
          </div>
          <button
            className="btn btn-dark export-btn"
            onClick={() => handleExport("pdf")}
            disabled={loadingPdf}
          >
            {loadingPdf ? (
              <><span className="spinner" style={{width:14,height:14,borderWidth:2}} /> Exporting...</>
            ) : (
              <><Download size={16} /> Download PDF</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Export;