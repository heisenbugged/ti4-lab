import { useState } from "react";
import { data, type MetaFunction } from "react-router";
import { IconDice, IconInfoCircle, IconPlayerPlay, IconSettings, IconShare, IconTrash, IconUsers, IconBell, IconCopy, IconHandFinger } from "@tabler/icons-react";
import { MainAppShell } from "~/components/MainAppShell";
import {
  Button, ButtonLink, Card, Checkbox, Chip, CopyButton, Grid, Heading, IconButton, ListRow, Menu, MenuItem, MenuSeparator, Modal, MultiSelect, Notice,
  NumberField, NumberStepper, Panel, PickButton, PlayerHex, PlayerTag, Popover, Progress, RadioGroup, Row, Rows, SectionHeader, Segmented, Select, SelectableCard,
  Slider, Spinner, Stack, Stat, Steps, Switch, Table, TabPanel, Tabs, Tag, Text, TextInput, Textarea, Tooltip, ValuePill, notify, Accordion, NamePlate, Pagination,
} from "~/ui";

export const meta: MetaFunction = () => [{ title: "UI kit - TI4 Lab" }];
export const loader = () => {
  if (process.env.NODE_ENV === "production") throw data("Not found", { status: 404 });
  return null;
};

/** Every design-system component in one place, for checking against the design artifact. */
export default function UiKit() {
  const [seg, setSeg] = useState("milty");
  const [n, setN] = useState(6);
  const [sw, setSw] = useState(true);
  const [modal, setModal] = useState(false);
  const [sel, setSel] = useState("std6");
  const [multi, setMulti] = useState<string[]>(["base", "pok", "te"]);
  const [nf, setNf] = useState<number | null>(0.5);
  const [sl, setSl] = useState<number | number[]>([9, 13]);
  const [mode, setMode] = useState("random");
  const [page, setPage] = useState(3);
  return (
    <MainAppShell>
      <Stack gap={7}>
        <Stack gap={2}>
          <Heading variant="display">UI kit</Heading>
          <Text tone="muted">Every component in ~/ui. Compare with the design artifact.</Text>
        </Stack>

        <Stack gap={4}>
          <SectionHeader title="Buttons" />
          <Row gap={3}>
            <Button variant="primary" icon={<IconPlayerPlay />}>Start draft</Button>
            <Button icon={<IconDice />}>Reroll slices</Button>
            <Button variant="tertiary">Edit settings</Button>
            <Button variant="danger" icon={<IconTrash />}>Delete draft</Button>
            <Button variant="primary" disabled>Start draft</Button>
            <Button loading>Saving</Button>
          </Row>
          <Row gap={3}>
            <Button variant="primary" size="lg">Lock in pick</Button>
            <Button size="sm" icon={<IconShare />}>Share</Button>
            <ButtonLink to="/map-presets" variant="tertiary">Community maps</ButtonLink>
            <IconButton label="Settings"><IconSettings /></IconButton>
            <IconButton label="Share" variant="outline"><IconShare /></IconButton>
            <IconButton label="Alerts" pressed><IconBell /></IconButton>
            <PickButton />
            <PickButton selected />
            <PickButton tone="minor">Minor</PickButton>
            <CopyButton value="hello" />
          </Row>
        </Stack>

        <Grid cols={{ base: 1, md: 2 }} gap={5}>
          <Panel title="Factions" icon={<IconUsers />} iconTint="var(--legendary)" action={<IconButton size="sm" label="Configure"><IconSettings /></IconButton>}>
            <Rows>
              <ListRow label="In pool" hint="Two more than players is typical">
                <NumberStepper value={n} label="factions" decrease={() => setN(n - 1)} increase={() => setN(n + 1)} decreaseDisabled={n <= 3} />
              </ListRow>
              <ListRow label="Enable minor factions"><Switch aria-label="Enable minor factions" checked={sw} onChange={setSw} /></ListRow>
              <ListRow label="Discordant Stars"><Row gap={4}><Checkbox label="Tiles" /><Checkbox label="Factions" defaultChecked /></Row></ListRow>
            </Rows>
          </Panel>
          <Panel title="Advanced options" collapsible defaultOpen={false} summary="Multidraft, home planets, monuments, Drahn">
            <Text>Collapsed content</Text>
          </Panel>
        </Grid>

        <Stack gap={4}>
          <SectionHeader title="Inputs" />
          <Grid cols={{ base: 1, sm: 2, lg: 3 }} gap={4}>
            <TextInput label="Draft name" placeholder="Friday night 6P" hint="Shown on the share link." />
            <TextInput label="Map string" defaultValue="26 69 19 xx" error="“xx” isn't a system number. Use 0 for an empty slot." />
            <Select label="Map layout" options={[{ value: "std6", label: "Standard 6P" }, { value: "lg6", label: "Large 6P" }]} value={sel} onChange={setSel} />
            <MultiSelect label="Game sets" options={[{ value: "base", label: "Base" }, { value: "pok", label: "PoK" }, { value: "te", label: "Thunder's Edge" }, { value: "us", label: "Uncharted Stars" }]} value={multi} onChange={setMulti} />
            <NumberField label="Tech skip value" value={nf} onChange={setNf} step={0.25} />
            <Textarea label="Description" placeholder="What makes this map special?" />
            <TextInput accent="var(--player-blue)" defaultValue="Meme Philosopher" aria-label="Player A" />
          </Grid>
          <Row gap={4}>
            <Segmented label="Draft style" value={seg} onChange={setSeg} options={[{ value: "milty", label: "Milty" }, { value: "eq", label: "Milty EQ" }, { value: "nucleus", label: "Nucleus" }]} />
            <Segmented size="sm" label="Players" value="6" onChange={() => {}} options={["Any", "3", "4", "5", "6", "8"].map((v) => ({ value: v, label: v }))} />
            <Chip pressed onChange={() => {}}>Legendary</Chip>
            <Chip pressed={false} onChange={() => {}}>Cultural</Chip>
          </Row>
          <div style={{ maxWidth: 420 }}><Slider label="Slice value" value={sl} onChange={setSl} min={0} max={20} /></div>
          <RadioGroup layout="cards" label="Minor faction mode" value={mode} onChange={setMode} options={[{ value: "random", label: "Random", description: "Random placement" }, { value: "shared", label: "Shared", description: "Same pool as majors" }, { value: "separate", label: "Separate", description: "Own faction pool" }]} />
        </Stack>

        <Stack gap={4}>
          <SectionHeader title="Feedback and overlays" />
          <Row gap={2}>
            <Tag>6P</Tag><Tag tone="ion">Milty</Tag><Tag tone="gold">Map of the day</Tag><Tag tone="success">Balanced</Tag><Tag tone="danger">Anomaly heavy</Tag><Tag tone="solid">New</Tag>
            <Spinner />
          </Row>
          <Grid cols={{ base: 1, md: 2 }} gap={3}>
            <Notice title="Simplified configuration">Players pick a reference card pack during the snake draft.</Notice>
            <Notice tone="danger" title="Invalid draft parameters" onClose={() => {}}>Try different minimal or total optimal values.</Notice>
          </Grid>
          <Progress value={37} />
          <Row gap={3}>
            <Button onClick={() => setModal(true)}>Open modal</Button>
            <Button onClick={() => notify({ title: "Pick locked in", message: "Jol-Nar goes to Meme Philosopher.", tone: "success" })}>Toast</Button>
            <Button onClick={() => notify({ title: "Couldn't reach the draft server", message: "Your pick is saved here.", tone: "danger" })}>Error toast</Button>
            <Tooltip label="Watch replay"><IconButton label="Replay"><IconPlayerPlay /></IconButton></Tooltip>
            <Popover trigger={<IconButton label="Value breakdown"><IconInfoCircle /></IconButton>} openOnHover title="Slice value" width={260}><Text size="sm" tone="muted">Base optimal 12.0, tech skips +1.0</Text></Popover>
            <Menu trigger={<Button size="sm">More</Button>}>
              <MenuItem icon={<IconCopy />} description="tidraft.com/draft/abc">Copy draft link</MenuItem>
              <MenuSeparator />
              <MenuItem icon={<IconHandFinger />} description="Shows hidden choices" checked={false}>Pick for any player</MenuItem>
            </Menu>
          </Row>
          <Modal opened={modal} onClose={() => setModal(false)} title="Delete this draft?" footer={<><Button variant="tertiary" onClick={() => setModal(false)}>Keep draft</Button><Button variant="danger" icon={<IconTrash />}>Delete draft</Button></>}>
            <Text tone="muted">Six players have made 14 picks. Deleting removes the draft and its share link for everyone.</Text>
            <TextInput label="Type the draft name to confirm" placeholder="Friday night 6P" />
          </Modal>
        </Stack>

        <Stack gap={4}>
          <SectionHeader title="Game pieces" />
          <Row gap={3}>
            <PlayerHex color="blue">A</PlayerHex><PlayerHex color="magenta" size="lg">F</PlayerHex>
            <PlayerTag color="blue" letter="A" name="Meme Philosopher" />
            <div style={{ width: 120 }}><PlayerTag color="red" name="Theodora Kingsley the Third" /></div>
            <ValuePill r={7} i={5} f={0} total={12} />
            <Stat value="13.6" label="Avg slice" />
            <NamePlate>Mecatol Rex</NamePlate>
          </Row>
          <Grid minWidth={240} gap={3}>
            <SelectableCard header={<><Text weight={600}>Emirates of Hacan</Text><span style={{ marginLeft: "auto" }}><PickButton /></span></>} body={<Text size="sm" tone="muted" style={{ padding: 8 }}>Info · Wiki</Text>} onSelect={() => {}} />
            <SelectableCard pending header={<Text weight={600}>Federation of Sol</Text>} />
            <SelectableCard selected selectedColor="blue" header={<><Text weight={600}>Universities of Jol-Nar</Text><span style={{ marginLeft: "auto" }}><PlayerTag color="blue" letter="A" name="Meme Philosopher" size="sm" /></span></>} />
            <Card interactive>Interactive card</Card>
          </Grid>
          <Tabs label="Summary" items={[{ value: "draft", label: "Draft" }, { value: "slice", label: "Slice", count: 6 }]}>
            <TabPanel value="draft">
              <Table>
                <Table.Thead><Table.Tr><Table.Th>Name</Table.Th><Table.Th>SV</Table.Th><Table.Th>Optimal</Table.Th></Table.Tr></Table.Thead>
                <Table.Tbody>
                  <Table.Tr><Table.Td>Quiver</Table.Td><Table.Td numeric>12.8</Table.Td><Table.Td><ValuePill r={7} i={5} f={0} size="sm" /></Table.Td></Table.Tr>
                  <Table.Tr><Table.Td>Fortuna</Table.Td><Table.Td numeric>12.5</Table.Td><Table.Td><ValuePill r={5} i={5} f={1} size="sm" /></Table.Td></Table.Tr>
                </Table.Tbody>
              </Table>
            </TabPanel>
            <TabPanel value="slice"><Text>Slices</Text></TabPanel>
          </Tabs>
          <Grid cols={{ base: 1, md: 2 }} gap={4}>
            <Steps active={0} items={[{ title: "Add the Discord bot to your server", content: <Button variant="discord" size="sm">Authorize</Button> }, { title: "Start a draft via /labdraft" }, { title: "Set up the draft on TI4 Lab" }]} />
            <Accordion items={[{ value: "a", title: "How slice scoring works", content: "Each starting position is scored on nearby systems." }, { value: "b", title: "How balance works", content: "Swaps systems to reduce the gap." }]} />
          </Grid>
          <Pagination page={page} total={12} onChange={setPage} />
        </Stack>
      </Stack>
    </MainAppShell>
  );
}
