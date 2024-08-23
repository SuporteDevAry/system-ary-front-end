declare module 'html2pdf.js' {
    interface Html2PdfOptions {
        margin?: number | [number, number, number, number];
        filename?: string;
        image?: { type: string, quality: number };
        enableLinks?: boolean;
        html2canvas?: any;
        jsPDF?: { unit: string, format: string | [number, number], orientation: string };
    }

    interface Html2Pdf {
        from(element: HTMLElement): Html2Pdf;
        set(options: Html2PdfOptions): Html2Pdf;
        save(): void;
        toPdf(): Promise<void>;
    }

    function html2pdf(): Html2Pdf;

    export default html2pdf;
}
