import { useSelector } from 'react-redux';



export const useNotificationPermissions = () => {
  const user = useSelector((state: any) => state.auth.user);
  
  if (!user) {
    return { canRead: false, canManage: false, canPublish: false };
  }
  
  if (user.isOwner) {
    return { canRead: true, canManage: true, canPublish: true };
  }
  
  const granted = new Set(user.permissions ?? []);
  
  return {
    canRead: granted.has('notification:read') || granted.has('notification:manage') || granted.has('notification:publish'),
    canManage: granted.has('notification:manage'),
    canPublish: granted.has('notification:publish'),
  };
};
