const Sidebar = () => {
    return (
        <aside className="w-64 bg-[#181818] border-r border-gray-700 p-4">
            <h2 className="text-gray-300 font-semibold">Explorer</h2>

            <div className="mt-4 space-y-2">
                <div className="text-sm text-gray-400">main.cpp</div>
                <div className="text-sm text-gray-400">script.py</div>
                <div className="text-sm text-gray-400">app.js</div>
            </div>
        </aside>
    );
};

export default Sidebar;