import { KEY_STORAGE } from "../const/constants";
const useAuth = () => {
  //esto es para verificar si en el navegador existe un inicio de sesion
  try {
    const _locaStorage = localStorage.getItem(KEY_STORAGE) ?? "";
    if (_locaStorage) {
      const session = _locaStorage ? JSON.parse(_locaStorage) : null;
      return session;
    }
  } catch (error) {
    console.log(error);
  }
  return null;
};

export default useAuth;
