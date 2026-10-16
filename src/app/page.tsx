import type { NextPage } from 'next';
import { Monitor } from '../components/Monitor/Monitor';
import { SetupGate } from '../components/SetupWizard/SetupWizard';

const MonitorPage: NextPage = () => {
  return (
    <SetupGate>
      <Monitor />
    </SetupGate>
  );
};

export default MonitorPage;
