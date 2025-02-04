import { Link, useLocation } from "react-router-dom";

interface BreadcrumbMap {
  [key: string]: string;
}

interface CustomBreadcrumbsProps {
  map: BreadcrumbMap; // Mapear rotas para nomes amigáveis
}

export function CustomBreadcrumbs({ map }: CustomBreadcrumbsProps) {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  return (
    <nav style={{ marginBottom: "16px" }}>
      <Link to="/dashboard">Home</Link>
      {pathnames.map((value, index) => {
        const isLast = index === pathnames.length - 1;
        const to = `/${pathnames.slice(0, index + 1).join("/")}`;

        return (
          <span key={to}>
            {" / "}
            {isLast ? (
              <span>{map[value] || value}</span>
            ) : (
              <Link to={to}>{map[value] || value}</Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
