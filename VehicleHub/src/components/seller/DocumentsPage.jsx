import { GenericTablePage } from '../../components/seller/GenericTablePage.jsx';
import { documentsData } from '../../data/sellerPagesMock.js';

export const DocumentsPage = () => (
    <GenericTablePage
        title="Documents"
        subtitle="Business verification documents on file."
        rows={documentsData}
        columns={[
            { key: 'name', label: 'Document' },
            { key: 'uploadedAt', label: 'Uploaded' },
            { key: 'status', label: 'Status' },
        ]}
    />
);