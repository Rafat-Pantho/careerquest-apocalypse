import { useEffect, useState } from 'react';
import axios from 'axios';
import DashboardLayout from '../components/layout/DashboardLayout';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import CreateBarterForm from '../components/forms/CreateBarterForm';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const SkillTavernPage = () => {
  const [barters, setBarters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchBarters = async () => {
    try {
      const response = await axios.get(`${API_URL}/barter`);
      setBarters(response.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBarters();
  }, []);

  const handleBarterCreated = () => {
    setIsModalOpen(false);
    fetchBarters();
  };

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-cinzel text-gold-400 mb-2">Skill Tavern</h1>
          <p className="text-parchment-300">Trade knowledge for knowledge.</p>
        </div>
        <Button variant="stone" onClick={() => setIsModalOpen(true)}>Open Stall</Button>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Open a Barter Stall"
      >
        <CreateBarterForm 
          onSuccess={handleBarterCreated}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

      {loading ? (
        <div className="text-center py-12 text-parchment-400">Loading trades...</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {barters.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-dungeon-800/30 rounded border border-dashed border-dungeon-600">
              <p className="text-parchment-400">The tavern is empty.</p>
            </div>
          ) : (
            barters.map(barter => (
              <div key={barter._id} className="dungeon-card">
                <div className="flex justify-between mb-4">
                  <div className="w-1/2 pr-2 border-r border-dungeon-600">
                    <p className="text-xs text-parchment-500 uppercase">Offering</p>
                    <h3 className="font-bold text-gold-400">{barter.offering.skill}</h3>
                  </div>
                  <div className="w-1/2 pl-2 text-right">
                    <p className="text-xs text-parchment-500 uppercase">Seeking</p>
                    <h3 className="font-bold text-mana-400">{barter.seeking.skill}</h3>
                  </div>
                </div>
                <Button className="w-full" variant="stone">Propose Trade</Button>
              </div>
            ))
          )}
        </div>
      )}
    </DashboardLayout>
  );
};

export default SkillTavernPage;
