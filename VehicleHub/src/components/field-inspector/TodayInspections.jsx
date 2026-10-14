import { Helmet } from 'react-helmet-async';
import { InspectionListPage } from '../../components/field-inspector/InspectionListPage.jsx';
import { useGetTodayScheduleQuery } from '../../services/fieldInspectorApiSlice.js';

export const TodayInspections = () => {
    const { data, isLoading, isError } = useGetTodayScheduleQuery();
    return (
        <>
            <Helmet><title>Today's Inspections | VehicleHub Inspector</title></Helmet>
            <InspectionListPage
                title="Today's Inspections"
                subtitle="Scheduled for today."
                inspections={data?.data || []}
                isLoading={isLoading}
                isError={isError}
                emptyText="No inspections scheduled for today."
            />
        </>
    );
};