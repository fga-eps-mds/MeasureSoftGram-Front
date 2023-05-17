import { useRouter } from "next/router";
import { useAuth } from "@contexts/Auth";
import { toast } from "react-toastify";

const useRequireAuth = () => {
    const { session, loading } = useAuth();
    const router = useRouter();

    if (loading === 'loaded' && !session && router.pathname !== '/') {
        toast.error('Você não está autorizado a acessar esta página. Por favor, faça login.');
        router.push('/');
    }
};

export default useRequireAuth;