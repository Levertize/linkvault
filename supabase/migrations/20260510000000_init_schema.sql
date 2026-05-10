-- Table: bookmarks
CREATE TABLE bookmarks (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  url         TEXT NOT NULL,
  title       TEXT NOT NULL,
  description TEXT,
  image_url   TEXT,
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for bookmarks
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own bookmarks"
  ON bookmarks
  FOR ALL
  USING (auth.uid() = user_id);

-- Table: tags
CREATE TABLE tags (
  id      UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name    TEXT NOT NULL,
  color   TEXT DEFAULT '#6366f1',
  UNIQUE(user_id, name)
);

-- RLS for tags
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own tags"
  ON tags
  FOR ALL
  USING (auth.uid() = user_id);

-- Table: bookmark_tags (junction)
CREATE TABLE bookmark_tags (
  bookmark_id UUID REFERENCES bookmarks(id) ON DELETE CASCADE,
  tag_id      UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (bookmark_id, tag_id)
);

-- RLS for bookmark_tags
ALTER TABLE bookmark_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own bookmark_tags"
  ON bookmark_tags
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM bookmarks
      WHERE bookmarks.id = bookmark_id
        AND bookmarks.user_id = auth.uid()
    )
  );
