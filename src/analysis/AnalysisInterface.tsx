import { AppShell, Container } from '@mantine/core';
import { useParams } from 'react-router-dom';
import AppHeader from './components/interface/AppHeader';
import { GlobalConfig } from '../parser/types';
import { SummaryBlock } from './dashboard/SummaryBlock';
import { StatsBoard } from './stats/StatsBoard';

export function AnalysisInterface(props: { globalConfig: GlobalConfig; }) {
  const { studyId } = useParams();

  return (
    <AppShell>
      <AppHeader studyIds={props.globalConfig.configsList} selectedId={studyId} />
      <Container fluid>
        <StatsBoard globalConfig={props.globalConfig} />
      </Container>
    </AppShell>
  );
}
