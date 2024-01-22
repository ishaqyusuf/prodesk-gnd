"use client";

import {
    ReactNode,
    createContext,
    useContext,
    useState,
    useTransition,
} from "react";
import Modal from ".";

interface ModalContextProps {
    show: (content: ReactNode, data?) => void;
    hide: () => void;
    data;
    opened?: boolean;
    loading?: boolean;
    setShowModal;
    startTransition;
}

const ModalContext = createContext<ModalContextProps | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
    const [modalContent, setModalContent] = useState<ReactNode | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [data, setData] = useState(null);
    const [loading, startTransition] = useTransition();
    const show = (content: ReactNode, _data?) => {
        setModalContent(content);
        setShowModal(true);
        setData(_data);
    };

    const hide = () => {
        setShowModal(false);
        setTimeout(() => {
            setModalContent(null);
        }, 300); // Adjust this timeout as per your transition duration
    };

    return (
        <ModalContext.Provider
            value={{
                show,
                hide,
                setShowModal,
                data,
                opened: showModal,
                loading,
                startTransition,
            }}
        >
            {children}
            {showModal && (
                <Modal showModal={showModal} setShowModal={setShowModal}>
                    {modalContent}
                </Modal>
            )}
        </ModalContext.Provider>
    );
}

export function useModal() {
    return useContext(ModalContext);
}
