import { Helmet } from 'react-helmet-async';
import { InspectionListPage } from '../../components/field-inspector/InspectionListPage.jsx';
import { useGetPendingInspectionsQuery } from '../../services/fieldInspectorApiSlice.js';

export const PendingInspections = () => {
    const { data, isLoading, isError } = useGetPendingInspectionsQuery();
    return (
        <>
            <Helmet><title>Pending Inspections | VehicleHub Inspector</title></Helmet>
            <InspectionListPage
                title="Pending Inspections"
                subtitle="Assignments waiting for your action."
                inspections={data?.data || []}
                isLoading={isLoading}
                isError={isError}
                emptyText="No pending inspections."
            />
        </>
    );
};