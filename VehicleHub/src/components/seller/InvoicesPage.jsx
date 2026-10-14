import { GenericTablePage } from '../../components/seller/GenericTablePage.jsx';
import { invoicesData } from '../../data/sellerPagesMock.jsx';
import { formatCurrency } from '../../utils/formatters.js';

export const InvoicesPage = () => (
    <GenericTablePage
        title="Invoices"
        subtitle="Billing history for completed sales."
        rows={invoicesData}
        columns={[
            { key: 'id', label: 'Invoice #' },
            { key: 'customer', label: 'Customer' },
            { key: 'amount', label: 'Amount', render: (r) => formatCurrency(r.amount) },
            { key: 'date', label: 'Date' },
            { key: 'status', label: 'Status' },
        ]}
    />
);