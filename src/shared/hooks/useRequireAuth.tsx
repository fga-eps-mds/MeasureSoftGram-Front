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
            "Usuário(a) não autenticado(a). Por favor, realize o login."
          );
          await router.push("/");
        };
  
        redirect();
      }
    }, [loading, session]);
  };

export default useRequireAuth;