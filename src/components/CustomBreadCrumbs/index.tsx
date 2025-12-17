import { useLocation, Link as RouterLink } from "react-router-dom";
import { Breadcrumbs } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { StyledBreadcrumbLink, StyledHomeBreadcrumbLink } from "./styles";

interface BreadcrumbMap {
  [key: string]: string;
}

interface CustomBreadcrumbsProps {
  map: BreadcrumbMap;
}

export function CustomBreadcrumbs({ map }: CustomBreadcrumbsProps) {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  //[x] Não mostrar breadcrumbs em páginas de autenticação
  if (
    location.pathname === "/" ||
    location.pathname === "/login" ||
    location.pathname === "/logout"
  ) {
    return null;
  }

  return (
    <Breadcrumbs
      separator={<NavigateNextIcon fontSize="small" />}
      aria-label="breadcrumb"
      sx={{ mb: 3 }}
    >
      {/* Home breadcrumb - sempre clicável */}
      <StyledHomeBreadcrumbLink
        component={RouterLink}
        to="/dashboard"
        underline="hover"
        sx={{
          color: "text.primary",
        }}
      >
        <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
        Home
      </StyledHomeBreadcrumbLink>

      {/* Breadcrumbs intermediários todos clicáveis */}
      {pathnames.map((value, index) => {
        const to = `/${pathnames.slice(0, index + 1).join("/")}`;
        const isLast = index === pathnames.length - 1;
        const label = map[value] || value;

        return isLast ? (
          // Último breadcrumb - não clicável (página atual)
          <span
            key={to}
            style={{
              color: "inherit",
              fontWeight: 500,
            }}
          >
            {label}
          </span>
        ) : (
          // Breadcrumbs intermediários - clicáveis
          <StyledBreadcrumbLink
            key={to}
            component={RouterLink}
            to={to}
            underline="hover"
            sx={{
              color: "inherit",
            }}
          >
            {label}
          </StyledBreadcrumbLink>
        );
      })}
    </Breadcrumbs>
  );
}
