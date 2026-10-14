import { GenericTablePage } from '../../components/seller/GenericTablePage.jsx';
import { paymentsData } from '../../data/sellerPagesMock.jsx';
import { formatCurrency } from '../../utils/formatters.js';

export const PaymentsPage = () => (
    <GenericTablePage
        title="Payments"
        subtitle="Payouts and settlement status."
        rows={paymentsData}
        columns={[
            { key: 'id', label: 'Payment ID' },
            { key: 'method', label: 'Method' },
            { key: 'amount', label: 'Amount', render: (r) => formatCurrency(r.amount) },
            { key: 'date', label: 'Date' },
            { key: 'status', label: 'Status' },
        ]}
    />
);