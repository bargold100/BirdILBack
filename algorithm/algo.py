import sys
import json
import numpy as np
import pandas as pd
from sklearn.cluster import DBSCAN
import similaritymeasures
from scipy.spatial.distance import euclidean
from fastdtw import fastdtw
from collections import defaultdict


class TrajectoryClustering:
    @classmethod
    def compute_distance_matrix(cls, trajectories, method="Frechet"):
        """
        :param method: "Frechet" or "Area"
        """
        n = len(trajectories)
        dist_m = np.zeros((n, n))
        for i in range(n - 1):
            p = trajectories[i]
            for j in range(i + 1, n):
                q = trajectories[j]
                if method == "Frechet":
                    dist_m[i, j] = similaritymeasures.frechet_dist(p, q)
                else:
                    dist_m[i, j] = similaritymeasures.area_between_two_curves(
                        p, q)
                dist_m[j, i] = dist_m[i, j]
        return dist_m

    @classmethod
    def clustering_by_dbscan(cls, distance_matrix, eps=1000):
        """
        :param eps: unit m for Frechet distance, m^2 for Area
        """
        epsilon=eps
        done= False
        while not done:
            cl = DBSCAN(epsilon, min_samples=1, metric='precomputed')
            # kmeans.fit(distance_matrix)
            cl.fit(distance_matrix)
            if len(np.unique(cl.labels_)) <= 8:
                done= True
            else:
               epsilon = epsilon + 0.5

        return cl.labels_
        # return kmeans.labels_

    @classmethod
    def load_cluster(cls, cluster_id):
        _df = cls.df_cluster
        _locations = _df.loc[_df["cluster_id"]
                             == cluster_id, ["lat", "lon"]].values
        return _locations[0]

def get_clusters(trajectories):
    #print(trajectories)
    dist_mat = TrajectoryClustering.compute_distance_matrix(trajectories)
    labels = TrajectoryClustering.clustering_by_dbscan(dist_mat, eps=2)
    paths_clusters = defaultdict(list)
    for i in range(len(trajectories)):
        paths_clusters[labels[i]].append(trajectories[i])
    
    return paths_clusters

#================mean part==================
def get_mean_path(trajectories):
    # mean of the max length trajectories
    # Use a list comprehension to get the lengths of all the items
    lengths = [len(item) for item in trajectories]

    # Use the max() function to get the maximum length
    max_length = max(lengths)

    # Use another list comprehension to get all the items with the maximum length
    #max_length_items = [item for item in trajectories if len(item) == max_length]
    max_length_paths =[]
    paths_to_pad = []
    for path in trajectories:
        if len(path) == max_length:
            max_length_paths.append(path)
        else:
            paths_to_pad.append(path)
            
    max_length_paths_np = np.array(max_length_paths)
    # Compute the average of max len trajectory
    avg_traj = np.mean(max_length_paths_np, axis=0)
    
    #list of the padding paths
    padded_paths = []

    #loop over all the paths needed to be pad
    for path_to_pad in paths_to_pad:
        #path returns tupel of index long, index short - (0,1)
        #0- index of the point in longer path
        #1- index of the point in shorter path
        distance, path_indexes = fastdtw(avg_traj, path_to_pad, dist=euclidean)
        # path_indexes = np.unique(path_indexes, axis=0)
        # remove duplicate entries in the 0 index of the tuples in the path list
        pad_path =[]
        if len(path_indexes) > max_length:
            path_indexes = [(i, j) for i, j in path_indexes if i not in [x[0] for x in path_indexes[:path_indexes.index((i, j))]]]       

        #build the padded path by duplicate similar points from the short path
        for index in path_indexes:
            pad_path.append(path_to_pad[index[1]])    
        padded_paths.append(pad_path)
    
    union_paths = padded_paths + max_length_paths
    average_path = np.mean(union_paths, axis=0)
    return average_path

def calc_mean_all_clusters(trajectories_list):
    res = {}
    clusters = get_clusters(trajectories_list)
    for cluster in clusters.keys():
        avg_trajectory = get_mean_path(clusters[cluster])
        res[f"{cluster}"] = {"avg_path":avg_trajectory.tolist(), "num_of_paths":len(clusters[cluster])}
    return res

if __name__ == "__main__":
    # Parse the trajectories string back to an array
    trajectories_list = json.loads(sys.stdin.read())
    #trajectories_list = json.loads(sys.argv[1])
    # Parse the trajectories dict to string so we can send to nodejs

    trajectoriesString = json.dumps(calc_mean_all_clusters(trajectories_list))
    print(trajectoriesString)

    # print(calc_mean_all_clusters(trajectories_list))