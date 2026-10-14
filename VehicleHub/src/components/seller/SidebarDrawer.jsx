import { AnimatePresence, motion } from 'framer-motion';
import { SellerSidebar } from './SellerSidebar.jsx';

export const SidebarDrawer = ({ isOpen, onClose }) => (
    <AnimatePresence>
        {isOpen && (
            <>
                <motion.div
                    className="fixed inset-0 z-40 bg-black/60"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                />
                <motion.div
                    className="fixed inset-y-0 left-0 z-50 w-[300px] overflow-hidden"
                    initial={{ x: '-100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '-100%' }}
                    transition={{ type: 'spring', stiffness: 260, damping: 28 }}
                >
                    <SellerSidebar isMobile={true} onClose={onClose} />
                </motion.div>
            </>
        )}
    </AnimatePresence>
);
