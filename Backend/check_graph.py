import pickle
p = r'C:\Users\Yashaswi\Desktop\dodge-ai-folder\Backend\graph.pkl'
with open(p,'rb') as f:
    G = pickle.load(f)
print('nodes', G.number_of_nodes(), 'edges', G.number_of_edges())
