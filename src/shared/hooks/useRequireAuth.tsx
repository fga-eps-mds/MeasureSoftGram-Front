import { useRouter } from "next/router";
import { useAuth } from "@contexts/Auth";
import { toast } from "react-toastify";
import { useEffect } from "react";

const useRequireAuth = () => {
    const { session, loading } = useAuth();
    const router = useRouter();
  
    useEffect(() => {
      if (loading === "loaded" && !session && router.pathname !== "/") {
        const redirect = async () => {
          toast.error(
            "Você não está autorizado a acessar esta página. Por favor, faça login."
          );
          await router.push("/");
        };
  
        redirect();
      }
    }, [loading, session]);
  };

export default useRequireAuth;