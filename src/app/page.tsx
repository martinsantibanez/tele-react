import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import type { NextPage } from 'next';
import Link from 'next/link';
import styles from '../styles/Home.module.css';

function HomeElement({
  description,
  title,
  href,
  className
}: {
  title: string;
  description?: string;
  href: string;
  className?: string;
}) {
  return (
    <Card className={`w-full ${className || ''}`}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardFooter>
        <Button className="w-full" asChild>
          <Link href={href}>{title}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

const Home: NextPage = () => {
  return (
    <div className={styles.container}>
      <main>
        <h1>Ver Tele</h1>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <HomeElement
            href="/monitor"
            title="Monitor"
            description="Monitor personalizable. Filas o layout."
            className="hidden md:flex"
          />
          <HomeElement
            href="/list"
            title="Lista"
            description="Elige solo un canal de la lista."
          />
          <HomeElement
            href="/duo"
            title="Duo mode"
            description="Preview one source, watch another."
            className="hidden md:flex"
          />
        </div>
      </main>
    </div>
  );
};

export default Home;
