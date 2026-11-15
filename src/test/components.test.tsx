import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import { ArchiveProvider, useArchive } from '../context/ArchiveContext';
import { AtlasPage } from '../pages/AtlasPage';
import { CrewFitPage } from '../pages/CrewFitPage';
import { useState } from 'react';

function renderAtlas() {
  return render(
    <MemoryRouter initialEntries={['/atlas']}>
      <ArchiveProvider>
        <Routes>
          <Route path="/atlas" element={<AtlasPage />} />
        </Routes>
      </ArchiveProvider>
    </MemoryRouter>,
  );
}

function renderCrewFit() {
  return render(
    <MemoryRouter initialEntries={['/crew-fit?preset=lunar']}>
      <ArchiveProvider>
        <Routes>
          <Route path="/crew-fit" element={<CrewFitPage />} />
        </Routes>
      </ArchiveProvider>
    </MemoryRouter>,
  );
}

function CompareHarness() {
  const { compare, addCompare } = useArchive();
  const [last, setLast] = useState('');
  const ids = ['bass', 'bass-ii', 'saffire-1', 'saffire-2', 'saffire-3'];
  return (
    <div>
      <span>Count {compare.length}</span>
      <span>Last {last}</span>
      {ids.map((id) => (
        <button key={id} type="button" onClick={() => setLast(String(addCompare(id)))}>
          Add {id}
        </button>
      ))}
    </div>
  );
}

afterEach(() => {
  window.localStorage?.clear();
});

describe('Atlas component', () => {
  it('filters to liquid records and clears back to all records', async () => {
    const user = userEvent.setup();
    renderAtlas();
    const table = screen.getByRole('table', { name: /Investigation records/ });
    expect(within(table).getByRole('link', { name: 'BASS' })).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText('Phase'), 'liquid');
    expect(within(table).getByRole('link', { name: 'FLEX' })).toBeInTheDocument();
    expect(within(table).queryByRole('link', { name: 'BASS' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Clear filters' }));
    expect(within(table).getByRole('link', { name: 'BASS' })).toBeInTheDocument();
  });

  it('shows an empty state with a working clear button', async () => {
    const user = userEvent.setup();
    renderAtlas();
    await user.type(screen.getByLabelText('Search'), 'zzzz-no-match');
    expect(screen.getByRole('heading', { name: 'No records match these filters.' })).toBeInTheDocument();
    await user.click(screen.getAllByRole('button', { name: 'Clear filters' })[0]!);
    expect(screen.queryByRole('heading', { name: 'No records match these filters.' })).not.toBeInTheDocument();
  });
});

describe('Compare limit', () => {
  it('stops at four records', async () => {
    const user = userEvent.setup();
    render(
      <ArchiveProvider>
        <CompareHarness />
      </ArchiveProvider>,
    );
    for (const id of ['bass', 'bass-ii', 'saffire-1', 'saffire-2', 'saffire-3']) {
      await user.click(screen.getByRole('button', { name: `Add ${id}` }));
    }
    expect(screen.getByText('Count 4')).toBeInTheDocument();
    expect(screen.getByText('Last false')).toBeInTheDocument();
  });
});

describe('Crew Fit weights', () => {
  it('renormalizes sliders back to 100 percent', () => {
    renderCrewFit();
    const slider = screen.getByLabelText('Function');
    fireEvent.change(slider, { target: { value: '0' } });
    expect(screen.getByText('Total 100.0%')).toBeInTheDocument();
    expect(screen.getByText('CFI-G')).toBeInTheDocument();
  });

  it('switches presets with a button', async () => {
    const user = userEvent.setup();
    renderCrewFit();
    await user.click(screen.getByRole('button', { name: /Spacecraft cabin/ }));
    expect(screen.getByRole('heading', { name: /Ranked for Spacecraft cabin/ })).toBeInTheDocument();
  });
});
