import { Pen, Trash2, Store as StoreIcon, Plus } from 'lucide-react'
import type { StoresPageController } from './hooks/useStoresPageController'

export function StoresView(props: StoresPageController) {
  const { stores, isLoading, handleAddStore, handleEditStore, handleDeleteStore } = props

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Stores</h1>
          <p className="text-base-content/70">Manage your purchase locations</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={handleAddStore}
        >
          <Plus className="w-4 h-4" />
          Add Store
        </button>
      </div>

      {stores && stores.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stores.map((store) => (
            <div key={store.id} className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <StoreIcon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{store.name}</h3>
                      <span
                        className={`badge badge-sm ${
                          store.type === 'OnlineOnly' ? 'badge-info'
                            : store.type === 'PhysicalOnly' ? 'badge-success'
                              : 'badge-warning'
                        }`}
                      >
                        {store.type === 'OnlineOnly' ? 'Online'
                          : store.type === 'PhysicalOnly' ? 'Physical'
                            : 'Hybrid'}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => handleEditStore(store)}
                    >
                      <Pen className="w-4 h-4" />
                    </button>
                    <button
                      className="btn btn-ghost btn-sm text-error"
                      onClick={() => handleDeleteStore(store)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <StoreIcon className="w-16 h-16 mx-auto text-base-content/30 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No stores yet</h3>
          <p className="text-base-content/70 mb-6">
            Add your first store to start tracking where you buy your books
          </p>
          <button
            className="btn btn-primary"
            onClick={handleAddStore}
          >
            <Plus className="w-4 h-4" />
            Add Store
          </button>
        </div>
      )}
    </div>
  )
}
