import {
  ActionIcon,
  Badge,
  Button,
  Flex,
  Grid,
  Group,
  Header,
  Image,
  Menu,
  Progress,
  Space,
  Title,
  Tooltip,
} from '@mantine/core';
import {
  IconDotsVertical,
  IconMail,
  IconSchema,
  IconUserPlus,
} from '@tabler/icons-react';
import { useEffect, useRef, useState } from 'react';
import { useHref } from 'react-router-dom';
import { useCurrentStep, useStudyId } from '../../routes/utils';
import {
  useStoreDispatch, useStoreSelector, useStoreActions, useFlatSequence,
} from '../../store/store';
import { useStorageEngine } from '../../storage/storageEngineHooks';
import { PREFIX } from '../../utils/Prefix';
import { useAuth } from '../../store/hooks/useAuth';

export default function AppHeader() {
  const { config: studyConfig, metadata } = useStoreSelector((state) => state);
  const flatSequence = useFlatSequence();
  const storeDispatch = useStoreDispatch();
  const { toggleShowHelpText, toggleStudyBrowser } = useStoreActions();
  const { storageEngine } = useStorageEngine();

  const currentStep = useCurrentStep();

  const auth = useAuth();

  const progressBarMax = flatSequence.length - 1;
  const progressPercent = typeof currentStep === 'number' ? (currentStep / progressBarMax) * 100 : 0;

  const [menuOpened, setMenuOpened] = useState(false);

  const logoPath = studyConfig?.uiConfig.logoPath;
  const withProgressBar = studyConfig?.uiConfig.withProgressBar;

  const studyId = useStudyId();
  const studyHref = useHref(`/${studyId}`);

  function getNewParticipant() {
    storageEngine?.nextParticipant(studyConfig, metadata)
      .then(() => {
        window.location.href = studyHref;
      })
      .catch((err) => {
        console.error(err);
      });
  }

  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  useEffect(() => {
    const element = titleRef.current;
    if (element) {
      setIsTruncated(element.scrollWidth > element.offsetWidth);
    }
  }, [studyConfig]);

  return (
    <Header height="70" p="md">
      <Grid mt={-7} align="center">
        <Grid.Col span={4}>
          <Flex align="center">
            <Image maw={40} src={`${PREFIX}${logoPath}`} alt="Study Logo" />
            <Space w="md" />
            <Title
              ref={titleRef}
              order={4}
              style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
              title={isTruncated ? studyConfig?.studyMetadata.title : undefined}
            >
              {studyConfig?.studyMetadata.title}
            </Title>
          </Flex>
        </Grid.Col>

        <Grid.Col span={4}>
          {withProgressBar && (
            <Progress radius="md" size="lg" value={progressPercent} />
          )}
        </Grid.Col>

        <Grid.Col span={4}>
          <Group noWrap position="right">
            {import.meta.env.VITE_REVISIT_MODE === 'public' ? <Tooltip multiline withArrow arrowSize={6} width={300} label="This is a demo version of the study, we’re not collecting any data. Navigate the study via the study browser on the right."><Badge size="lg" color="orange">Demo Mode</Badge></Tooltip> : null}
            {studyConfig?.uiConfig.helpTextPath !== undefined && (
              <Button
                variant="outline"
                onClick={() => storeDispatch(toggleShowHelpText())}
              >
                Help
              </Button>
            )}

            {(import.meta.env.DEV || import.meta.env.VITE_REVISIT_MODE === 'public' || auth.user.isAdmin) && (
              <Menu
                shadow="md"
                width={200}
                zIndex={1}
                opened={menuOpened}
                onChange={setMenuOpened}
              >
                <Menu.Target>
                  <ActionIcon size="lg" className="studyBrowserMenuDropdown">
                    <IconDotsVertical />
                  </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item
                    icon={<IconSchema size={14} />}
                    onClick={() => storeDispatch(toggleStudyBrowser())}
                  >
                    Study Browser
                  </Menu.Item>

                  <Menu.Item
                    component="a"
                    href={
                      studyConfig !== null
                        ? `mailto:${studyConfig.uiConfig.contactEmail}`
                        : undefined
                    }
                    icon={<IconMail size={14} />}
                  >
                    Contact
                  </Menu.Item>

                  <Menu.Item
                    icon={<IconUserPlus size={14} />}
                    onClick={() => getNewParticipant()}
                  >
                    Next Participant
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            )}
          </Group>
        </Grid.Col>
      </Grid>
    </Header>
  );
}
