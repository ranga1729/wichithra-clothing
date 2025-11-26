export const metadata = {
  title: 'Wichithra',
};

export default function ShopFrontLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <main>
        {children}
      </main>
    </div>
  );
}
