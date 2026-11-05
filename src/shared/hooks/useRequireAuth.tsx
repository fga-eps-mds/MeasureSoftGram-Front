import { useRouter } from "@hooks/useRouter";
import { useAuth } from "@contexts/Auth";
import { toast } from "react-toastify";
import { useEffect } from "react";
import { isLoggingOut } from "@contexts/Auth/logoutState";

const useRequireAuth = () => {
  const { session, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading === "loaded" && !session && router.pathname !== "/" && !isLoggingOut()) {
      const redirect = async () => {
        toast.error(
          "Usuário(a) não autenticado(a). Por favor, realize o login."
        );
        await router.push("/");
      };

      redirect().catch((error) => {
        console.error('An error occurred while navigating:', error);
      });
    }
  }, [loading, session]);
};

export default useRequireAuth;