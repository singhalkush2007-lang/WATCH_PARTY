import { useOutletContext } from 'react-router-dom';
import { Plus, Ticket } from 'lucide-react';
import { SectionHead, EmptyState } from '../components/ui/Primitives';

export default function MyRoomsPage() {
  const { openCreateRoom, openJoinRoom } = useOutletContext();
  return (
    <div className="lobby-page">
      <header className="lobby-page-head">
        <SectionHead number="03" caption="My rooms" title={<>Your <span className="serif">tickets</span></>} as="h1" />
        <p className="lede">Every room you host or join is kept here, so the next screening is one click away.</p>
      </header>
      <EmptyState
        number="00"
        title="You haven't saved any rooms yet"
        action={
          <div className="empty-actions">
            <button className="btn btn-primary" onClick={openCreateRoom}><Plus /> Create a room</button>
            <button className="btn btn-secondary" onClick={openJoinRoom}><Ticket /> Join with a code</button>
          </div>
        }
      >
        Start your first screening, or join a friend's with the code on their ticket.
      </EmptyState>
    </div>
  );
}
