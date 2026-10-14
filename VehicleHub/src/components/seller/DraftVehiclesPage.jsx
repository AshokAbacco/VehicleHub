import { GenericTablePage } from '../../components/seller/GenericTablePage.jsx';
import { inventoryStatusData } from '../../data/sellerPagesMock.jsx';
import { formatCurrency } from '../../utils/formatters.js';

export const DraftVehiclesPage = () => (
    <GenericTablePage
        title="Draft Vehicles"
        subtitle="Listings you've started but haven't published yet."
        rows={inventoryStatusData['draft-vehicles']}
        columns={[
            { key: 'title', label: 'Vehicle' },
            { key: 'category', label: 'Category' },
            { key: 'price', label: 'Price', render: (r) => formatCurrency(r.price) },
            { key: 'completion', label: 'Completion', render: (r) => `${r.completion}%` },
            { key: 'updatedAt', label: 'Last edited' },
        ]}
        emptyText="No drafts — start a new listing from Add Vehicle."
    />
);