export const appRoutes = {
  home: "/",
  admin: "/admin",
  portal: "/portal",
  erp: "/erp"
};

export function getAppRoute(pathname = window.location.pathname) {
  if (pathname.startsWith(appRoutes.admin)) {
    return "admin";
  }

  if (pathname.startsWith(appRoutes.portal)) {
    return "portal";
  }

  if (pathname.startsWith(appRoutes.erp)) {
    return "erp";
  }

  return "public";
}
