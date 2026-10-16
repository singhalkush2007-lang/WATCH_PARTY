import { Search, UserPlus } from 'lucide-react';
import { SectionHead, EmptyState } from '../components/ui/Primitives';

export default function FriendsPage() {
  return (
    <div className="lobby-page">
      <header className="lobby-page-head lobby-page-head-split">
        <div>
          <SectionHead number="04" caption="Friends" title={<>The guest <span className="serif">list</span></>} as="h1" />
          <p className="lede">Manage your friends and watch history.</p>
        </div>
        <form className="friend-add" onSubmit={(e) => e.preventDefault()} role="search">
          <div className="search-wrap">
            <Search aria-hidden="true" />
            <input type="text" className="input" placeholder="Search by username" aria-label="Search by username" />
          </div>
          <button type="submit" className="btn btn-primary"><UserPlus /> Add friend</button>
        </form>
      </header>
      <EmptyState number="00" title="Your guest list is empty">
        No friends added yet. Add people by username and you'll see when they're watching.
      </EmptyState>
    </div>
  );
}
